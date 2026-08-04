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

function firstVisible(selectors: string[]): Element | null {
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel)
    if (el && el.offsetParent !== null) return el
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
    selectors: ['[data-tour="tour-prod-add-child"]'],
    popover: {
      title: 'El + y los productos huérfanos',
      description: 'Este botón agrega productos huérfanos existentes a esta familia. Un huérfano es un producto que activaste como "Producto hijo" al crearlo o editarlo, pero que todavía no quedó asignado a ninguna familia — vive suelto en la pestaña "Sin asignar" hasta que lo sumes a una carpeta desde acá.',
      side: 'left',
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
    selectors: ['[data-tour="tour-prod-list"]'],
    popover: {
      title: 'Acá vive todo tu catálogo',
      description: 'Cada fila es un producto o una familia — tocá una familia para desplegar sus variantes. Lápiz para editar, tacho para eliminar. Todo se guarda al toque.',
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

function pageStepsFor(pathname: string): TourStepDef[] {
  if (pathname.startsWith('/admin/productos')) return productosSteps
  if (pathname.startsWith('/admin/destacados')) return destacadosSteps
  return dashboardSteps
}

export function getAdminTourSteps(pathname: string): DriveStep[] {
  return buildSteps([...sidebarSteps, ...pageStepsFor(pathname)])
}
