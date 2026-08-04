// src/lib/adminTour.ts
import type { DriveStep, Popover } from 'driver.js'

interface TourStepDef {
  // Se prueban en orden — se usa el primer selector que exista Y esté
  // visible (offsetParent !== null). Cubre los casos donde el mismo
  // concepto tiene una versión desktop y otra mobile en el DOM a la vez.
  selectors: string[]
  popover: Popover
  // Vive dentro del sidebar — en mobile es un Sheet que hay que abrir a
  // mano antes de poder resolver el elemento (ver AdminTourButton).
  sidebar?: boolean
}

// Ojo: el mismo data-tour puede existir varias veces a la vez en el DOM
// (versión desktop Y mobile renderizadas juntas, solo una visible por CSS).
// Nunca usar querySelector a secas para esto — agarra la primera en orden
// del DOM sin importar si está oculta, y en este proyecto la versión mobile
// suele aparecer primero en el JSX.
function queryVisible<T extends Element = HTMLElement>(selector: string): T | null {
  const matches = document.querySelectorAll<T>(selector)
  for (const el of matches) {
    if ((el as unknown as HTMLElement).offsetParent !== null) return el
  }
  return null
}

function firstVisible(selectors: string[]): Element | null {
  for (const sel of selectors) {
    const el = queryVisible(sel)
    if (el) return el
  }
  return null
}

function buildSteps(defs: TourStepDef[]): DriveStep[] {
  const steps: DriveStep[] = []
  for (const def of defs) {
    const element = firstVisible(def.selectors)
    if (element) steps.push({ element, popover: def.popover, data: { sidebar: !!def.sidebar } })
  }
  return steps
}

export function isSidebarTourStep(step: DriveStep | undefined): boolean {
  return !!step?.data?.sidebar
}

// ─── Pasos "dinámicos" (viven detrás de un tab de React) ───────────────────
// A diferencia de buildSteps(), acá NO se resuelve el elemento al armar la
// lista — driver.js lo vuelve a buscar cada vez que navega a ese paso (vía
// función), porque puede no existir todavía si el tab no está activo. El
// cambio de tab lo dispara AdminTourButton antes de avanzar/retroceder.
interface FormTourStepDef {
  // Pestaña (data-tour-tab) que hay que activar antes de este paso.
  // undefined = elemento siempre visible, sin importar el tab activo.
  tab?: string
  selectors: string[]
  popover: Popover
}

function buildFormSteps(defs: FormTourStepDef[]): DriveStep[] {
  return defs.map(def => ({
    element: (() => {
      for (const sel of def.selectors) {
        const el = queryVisible(sel)
        if (el) return el
      }
      return undefined
      // driver.js tipa element como Element, pero en runtime tolera
      // perfectamente que la función devuelva undefined (ahí es cuando
      // entra a jugar skipMissingElement).
    }) as unknown as () => Element,
    popover: def.popover,
    data: { tab: def.tab },
  }))
}

export function stepRequiredTab(step: DriveStep | undefined): string | undefined {
  return step?.data?.tab as string | undefined
}

// Para pasos que necesitan algo más que "activar un tab" antes de mostrarse
// (por ej. Productos: cambiar el filtro Y desplegar una familia). Puede ser
// async — AdminTourButton espera a que resuelva antes de seguir.
export function stepBeforeShow(step: DriveStep | undefined): (() => void | Promise<void>) | undefined {
  return step?.data?.beforeShow as (() => void | Promise<void>) | undefined
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

// Los TabsTrigger de Radix activan la pestaña en base a eventos reales de
// puntero/foco (mousedown + focus), no en el evento "click" — un simple
// el.click() no alcanza para simularlo, hay que despachar la secuencia
// completa como lo haría un usuario real.
export function clickFormTab(tabId: string) {
  const el = document.querySelector<HTMLElement>(`[data-tour-tab="${tabId}"]`)
  if (!el) return
  const rect = el.getBoundingClientRect()
  const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 }
  el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerId: 1, button: 0 }))
  el.dispatchEvent(new MouseEvent('mousedown', opts))
  el.focus()
  el.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerId: 1, button: 0 }))
  el.dispatchEvent(new MouseEvent('mouseup', opts))
  el.dispatchEvent(new MouseEvent('click', opts))
}

// ─── Control remoto del filtro de Productos ────────────────────────────────
// Products.tsx se registra acá (useEffect) para que el tour pueda cambiar
// el tab "Todos/Únicos/Familias/Sin asignar" directamente por estado de
// React, sin depender de simular clicks (evita el lío de Radix en desktop
// y el hecho de que en mobile ese control vive adentro de un Sheet cerrado).
type ProductsTab = 'todos' | 'unicos' | 'variantes' | 'hijos'
let productsTourSetTab: ((tab: ProductsTab) => void) | null = null

export function registerProductsTourSetTab(fn: ((tab: ProductsTab) => void) | null) {
  productsTourSetTab = fn
}

// Antes de explicar el "+" de huérfanos: cambia a la pestaña "Familias" y
// despliega la primera carpeta que encuentre, para que el botón (y sus
// variantes al lado) queden a la vista y se puedan señalar con confianza.
async function prepareAddChildStep() {
  productsTourSetTab?.('variantes')
  await sleep(250)
  const row = queryVisible('[data-tour="tour-prod-family-row"]')
  if (row && row.getAttribute('data-expanded') !== 'true') {
    row.click()
    await sleep(350)
  }
}

const addChildStep: DriveStep = {
  element: (() => queryVisible('[data-tour="tour-prod-add-child"]') ?? undefined) as unknown as () => Element,
  popover: {
    title: 'El + y los productos huérfanos',
    description: 'Este botón agrega productos huérfanos existentes a esta familia. Un huérfano es un producto que activaste como "Producto hijo" al crearlo o editarlo, pero que todavía no quedó asignado a ninguna familia — vive suelto en la pestaña "Sin asignar" hasta que lo sumes a una carpeta desde acá.',
    side: 'left',
    align: 'start',
  },
  data: { beforeShow: prepareAddChildStep },
}

const sidebarSteps: TourStepDef[] = [
  {
    sidebar: true,
    selectors: ['[data-tour="tour-logo"]'],
    popover: {
      title: '👋 ¡Bienvenido!',
      description: 'Te muestro rapidísimo cómo funciona esto. Este logo te lleva de vuelta al sitio público en cualquier momento — bancate un toque.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    sidebar: true,
    selectors: ['[data-tour="tour-nav"]'],
    popover: {
      title: 'Tu menú principal',
      description: 'Tres secciones, nada más: Dashboard (el resumen de todo), Productos (donde cargás y editás) y Destacados (lo que se luce primero en el inicio).',
      side: 'right',
      align: 'start',
    },
  },
  {
    sidebar: true,
    selectors: ['[data-tour="tour-cache"]'],
    popover: {
      title: 'El botón mágico 🔄',
      description: 'Si editaste algo y todavía no lo ves reflejado en el sitio público, apretá acá. Limpia la caché y trae todo fresquito.',
      side: 'top',
      align: 'start',
    },
  },
]

const dashboardSteps: TourStepDef[] = [
  {
    selectors: ['[data-tour="tour-dash-stats"]'],
    popover: {
      title: 'El pulso del negocio',
      description: 'De un vistazo: cuántos productos tenés en total, cuántos con stock, cuáles están por encargo y cuáles se te están por agotar.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-dash-structure"]'],
    popover: {
      title: 'Cómo está armado el catálogo',
      description: 'Qué proporción de tus productos son "únicos" (van solos), cuáles forman parte de una familia con variantes, y si quedó algún hijo dando vueltas sin asignar.',
      side: 'top',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-dash-donut"]'],
    popover: {
      title: 'Stock de un vistazo',
      description: 'La rosquita compara lo que tenés en stock contra lo que es por encargo. Perfecta para chequear el estado general sin pensar mucho.',
      side: 'top',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-dash-alerts"]'],
    popover: {
      title: 'Ojo con esto ⚠️',
      description: 'Los productos con poco stock aparecen acá. Tocá "Ver todos" y andá directo a reponerlos antes de que se agoten del todo.',
      side: 'top',
      align: 'start',
    },
  },
]

const productosSteps: TourStepDef[] = [
  {
    selectors: ['[data-tour="tour-prod-actions-desktop"]', '[data-tour="tour-prod-actions-mobile"]'],
    popover: {
      title: 'Sumar cosas nuevas',
      description: '"Crear familia" arma una carpeta para agrupar variantes de un mismo producto (por ej. distintos tamaños). "Agregar producto" carga uno nuevo de cero.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-prod-stats"]'],
    popover: {
      title: 'Resumen rápido',
      description: 'Lo mismo que en el Dashboard, pero enfocado en lo que estás viendo en esta lista ahora mismo.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-prod-tabs"]', '[data-tour="tour-prod-searchbar"]'],
    popover: {
      title: 'Filtrar y ordenar',
      description: 'Buscá por nombre o código, filtrá por categoría o stock, y cambiá entre "Todos", "Únicos", "Familias" o "Sin asignar" para enfocarte en lo que necesitás.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-prod-pending"]'],
    popover: {
      title: 'Familias pendientes',
      description: 'Estas carpetas se crearon con "Crear familia" pero todavía no tienen ningún producto adentro. Tocá una para agregarle su primer hijo, o eliminala con la X si te arrepentiste.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-prod-list"]'],
    popover: {
      title: 'Acá vive todo tu catálogo',
      description: 'Cada fila es un producto o una familia — tocá una familia para desplegar sus variantes. Lápiz para editar, tacho para eliminar. En la compu también tenés un interruptor para mostrar/ocultar cada uno del catálogo público sin borrarlo. Todo se guarda al toque, sin recargar la página.',
      side: 'top',
      align: 'start',
    },
  },
]

const destacadosSteps: TourStepDef[] = [
  {
    selectors: ['[data-tour="tour-dest-slots"]'],
    popover: {
      title: 'Tu vidriera del inicio ⭐',
      description: 'Estos 5 espacios son el carrusel destacado que ve todo el mundo al entrar al sitio. Arrastrá para reordenar en la compu, o usá las flechitas en el celular.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-dest-search"]'],
    popover: {
      title: 'Sumar un destacado',
      description: 'Buscá el producto que querés lucir y tocalo — se acomoda solo en el primer espacio libre.',
      side: 'top',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-dest-summary"]'],
    popover: {
      title: 'Cuánto te falta',
      description: 'De un vistazo, cuántos de los 5 lugares ya usaste.',
      side: 'top',
      align: 'start',
    },
  },
]

// ─── Formulario de producto (crear / editar) — con cambio de tab ──────────
const productFormSteps: FormTourStepDef[] = [
  {
    selectors: ['[data-tour="tour-form-tabs"]'],
    popover: {
      title: 'Las 3 pestañas del formulario',
      description: '"Básico" tiene lo esencial: nombre, precio, stock. "Especificaciones" son medidas y datos técnicos — se convierte en "Comentario" si activás Venta a medida. "Características" son los bullets y accesorios que ve el cliente en la ficha pública.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    tab: 'basico',
    selectors: ['[data-tour="tour-form-family-badge"]'],
    popover: {
      title: 'Pertenece a una familia',
      description: 'Este chip aparece cuando el producto ya forma parte de una familia con variantes. Tocá la miniatura para ir directo a "Editar familia", o "Quitar" para desvincularlo y que pase a ser un hijo huérfano suelto.',
      side: 'left',
      align: 'start',
    },
  },
  {
    tab: 'basico',
    selectors: ['[data-tour="tour-form-identity"]'],
    popover: {
      title: 'Nombre, categoría e imagen',
      description: 'Arman la ficha pública. Si el producto ya pertenece a una familia, estos campos se bloquean acá — se editan desde "Editar familia" para que todas las variantes queden sincronizadas con el mismo nombre e imagen.',
      side: 'right',
      align: 'start',
    },
  },
  {
    tab: 'basico',
    selectors: ['[data-tour="tour-form-variant"]'],
    popover: {
      title: 'Código, precio y stock',
      description: 'El código identifica a esta variante puntual (tiene que ser único). El precio y el stock definen si se muestra "En stock" o "Por encargo" en el catálogo — se calcula solo según la cantidad que cargues, no hace falta tocar nada más.',
      side: 'left',
      align: 'start',
    },
  },
  {
    tab: 'basico',
    selectors: ['[data-tour="tour-form-toggles"]'],
    popover: {
      title: '4 interruptores importantes',
      description: '"Visible" lo muestra u oculta del catálogo sin borrarlo. "Mostrar precio" controla si el precio se ve en la ficha. "Producto hijo" lo convierte en huérfano — sin familia hasta que lo asignes desde Productos. "Venta a medida" cambia la pestaña Especificaciones por un comentario libre, para productos que se fabrican a pedido.',
      side: 'top',
      align: 'start',
    },
  },
  {
    tab: 'especificaciones',
    selectors: ['[data-tour="tour-form-specs"]', '[data-tour="tour-form-comentario"]'],
    popover: {
      title: 'Medidas y datos técnicos',
      description: 'Ancho, profundidad y alto (con mínimo/máximo si es regulable), peso, capacidad y datos técnicos como potencia o consumo de gas — todo opcional, completá lo que aplique. Si activaste "Venta a medida", en cambio, esto se reemplaza por un comentario libre para explicarle al cliente cómo funciona el pedido.',
      side: 'top',
      align: 'start',
    },
  },
  {
    tab: 'caracteristicas',
    selectors: ['[data-tour="tour-form-caracteristicas"]'],
    popover: {
      title: 'Bullets de características',
      description: 'Lista de características generales que se muestran en la ficha pública — solo para productos únicos. Si es parte de una familia, se editan desde "Editar familia" porque se comparten entre todas las variantes.',
      side: 'right',
      align: 'start',
    },
  },
  {
    tab: 'caracteristicas',
    selectors: ['[data-tour="tour-form-accesorios"]'],
    popover: {
      title: 'Accesorios incluidos',
      description: 'Todo lo que viene de fábrica con esta variante puntual — a diferencia de las características, esto sí es propio de cada variante, no se comparte con la familia. La aclaración de abajo es para casos puntuales, como un gabinete específico para otro producto.',
      side: 'left',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-form-submit"]'],
    popover: {
      title: 'Guardar los cambios',
      description: 'Nada se guarda hasta que tocás acá. Podés moverte entre las 3 pestañas sin perder lo que cargaste — recién se guarda todo junto al confirmar.',
      side: 'top',
      align: 'start',
    },
  },
]

// ─── Formulario de familia (editar) ────────────────────────────────────────
const familyFormSteps: FormTourStepDef[] = [
  {
    selectors: ['[data-tour="tour-family-form-identity"]'],
    popover: {
      title: 'Datos compartidos de la familia',
      description: 'Nombre, categoría, imagen y características de acá son los que ve el catálogo público — se aplican a todas las variantes juntas. Cada variante conserva su propio nombre interno (etiqueta), pero de cara al cliente todas comparten esta identidad.',
      side: 'right',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-family-form-variants"]'],
    popover: {
      title: 'Variantes de esta familia',
      description: 'Los productos hijo que forman parte de esta carpeta. Tocá cualquiera para ir a editarlo, o "Agregar variante" para sumar un producto huérfano existente desde el pool de "Sin asignar".',
      side: 'left',
      align: 'start',
    },
  },
  {
    selectors: ['[data-tour="tour-family-form-submit"]'],
    popover: {
      title: 'Guardar los cambios',
      description: 'Nada se guarda hasta que tocás acá.',
      side: 'top',
      align: 'start',
    },
  },
]

function isProductFormRoute(pathname: string): boolean {
  return pathname === '/admin/productos/nuevo' || /^\/admin\/productos\/[^/]+$/.test(pathname)
}

function isFamilyFormRoute(pathname: string): boolean {
  return /^\/admin\/familias\/[^/]+$/.test(pathname)
}

function pageStepsFor(pathname: string): TourStepDef[] {
  if (pathname === '/admin/productos') return productosSteps
  if (pathname.startsWith('/admin/destacados')) return destacadosSteps
  return dashboardSteps
}

export function getAdminTourSteps(pathname: string): DriveStep[] {
  if (isProductFormRoute(pathname)) {
    return [...buildSteps(sidebarSteps), ...buildFormSteps(productFormSteps)]
  }
  if (isFamilyFormRoute(pathname)) {
    return [...buildSteps(sidebarSteps), ...buildFormSteps(familyFormSteps)]
  }
  if (pathname === '/admin/productos') {
    const steps = buildSteps([...sidebarSteps, ...productosSteps])
    // Se inserta justo después de "Sumar cosas nuevas" (sidebar + 1er paso).
    const insertAt = sidebarSteps.length + 1
    steps.splice(insertAt, 0, addChildStep)
    return steps
  }
  return buildSteps([...sidebarSteps, ...pageStepsFor(pathname)])
}
