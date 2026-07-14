# Rediseño premium mobile — ProductModal

## Contexto

`ProductModal.tsx` es el modal de detalle de producto del catálogo público (no el admin). Hoy comparte un único layout responsive: en mobile es una columna (imagen arriba, header, contenido scrolleable, CTAs abajo); en desktop es un grid `420px_1fr`.

El diseño desktop se considera correcto y **no se toca**. El pedido es elevar la versión mobile a un estándar premium B2B industrial (referencia: Rational, Unox, Electrolux Professional), sin modificar lógica de negocio ni el layout desktop.

## Alcance

- Archivo: [src/components/catalog/ProductModal.tsx](../../../src/components/catalog/ProductModal.tsx)
- Estilos: [src/index.css](../../../src/index.css), bloque `.modal-product-*` (líneas ~217-282)
- Solo el breakpoint mobile (por debajo de `sm:`). Las clases `sm:*` que definen el grid desktop no cambian.
- No cambia: props del componente, `onAddToQuote`/`onRemoveFromQuote`, generación de URL de WhatsApp, `ConfirmDialog`, lógica de variantes, cálculo de `density`/specs/caract/accesorios.

## Diseño

### 1. Estructura general (sin cambios de arquitectura)

Se mantiene el flex-column actual: imagen → header → contenido scrolleable (`flex-1 min-h-0 overflow-y-auto`) → CTAs (`flex-shrink-0`, fuera del scroll). Este patrón ya garantiza que los botones queden siempre visibles sin scroll, sin necesitar `position: fixed`. No se introduce ningún cambio estructural aquí, solo visual.

### 2. Imagen hero

- Alto: `h-[30dvh]` → `h-[38dvh]`.
- Fondo del panel de imagen: `#F0EBE2` → `var(--warm-50)` (más limpio/neutro).
- Se elimina el overlay `bg-gradient-to-t from-black/60` pesado. Si el badge de disponibilidad necesita contraste, se le da fondo propio con sombra en vez de depender del gradiente sobre la imagen.
- Se elimina el bloque `modal-product-media-meta` / `modal-product-media-category` (categoría superpuesta en la imagen) — es redundante con el eyebrow de categoría que ya existe en el header de info, y ensucia visualmente la foto.
- `AvailabilityBadge` se mantiene arriba-izquierda; se ajusta su contenedor para más aire y sombra suave (el componente `AvailabilityBadge.tsx` en sí no se modifica, solo su posicionamiento/wrapper en el modal si hace falta).

### 3. Botón cerrar

- Se mantiene arriba-derecha, flotante.
- Cambia de `rounded-lg` a `rounded-full`, fondo blanco con leve blur/translucidez, sombra sutil (`shadow-sm`/`shadow-md`, no `shadow-lg`), sin borde marcado (`border-[#E8E2D9]` se aligera o se quita).
- Tamaño: de `w-11 h-11` a algo ligeramente menor (`w-10 h-10`) para sentirse más minimalista, dentro de límites de área táctil (≥40px, ok para mobile).

### 4. Header de info

- Eyebrow de categoría: mismo patrón visual (barra roja `modal-product-header-accent` + texto uppercase), se puede aumentar levemente `letter-spacing`/margen.
- Título (`modal-product-header-title`): tamaño sube de `1.22rem` a `1.35rem` en mobile (usar variante de clase o media query dentro de la regla existente), `line-height` ajustado.
- No se agrega logo EMPERO dentro del modal (decisión confirmada — ya está en el header del sitio).
- Selector de variantes: mismos chips, `rounded` → `rounded-full`.

### 5. Especificaciones técnicas → tarjeta con ícono por fila

- Reemplaza la tabla actual (zebra striping label/value) por una tarjeta `rounded-2xl` con borde suave (`border-[#EBE5DC]` o similar) conteniendo filas separadas por `divide-y` sutil (`divide-[#F5F1EB]`).
- Cada fila agrega un ícono pequeño a la izquierda del label, mapeado por tipo de spec (ejemplos con `lucide-react`, ya es dependencia del proyecto):
  - Dimensiones → `Ruler` (o `Maximize`)
  - Capacidad → `Layers` (ya usado en el componente)
  - Voltaje → `Zap`
  - Peso → `Weight`
  - Volumen → `Box`
  - Motor/RPM → `Gauge`
  - Canasto → `ShoppingBasket` (o `Package`)
  - Potencia → `Zap` / `Power`
  - Temperaturas → `Thermometer`
  - Programas → `ListChecks`
  - Fallback genérico si no hay ícono claro para algún spec → `Settings` (el ícono de sección actual)
- Padding vertical por fila aumenta levemente respecto al actual (`d.specRowPy`) para la variante mobile.
- Valor alineado a la derecha, semibold, mismo criterio de color actual.

### 6. Características → grilla de beneficios 2 columnas

- Hoy la grilla de 2 columnas solo se activa si `caractLen > 5` (`caractTwoCols`). En mobile se fuerza 2 columnas siempre (independiente de la cantidad), salvo que el texto de un ítem sea muy largo y rompa la legibilidad — si eso ocurre visualmente en la implementación, evaluar caso por caso (ítems largos pueden hacer `col-span-2` puntual, decisión de implementación, no bloqueante).
- El ícono de check (`Check` dentro de círculo) pasa de `w-3.5 h-3.5` a `w-4 h-4`, con fondo `bg-[#FFF0F1]` y borde `border-[#F5C5C9]` iguales, ligeramente más grande.
- No se reescribe el copy de producto (viene de datos `caracteristicas_generales`), solo la presentación visual.
- Accesorios incluidos sigue el mismo criterio de 2 columnas forzadas en mobile.

### 7. Botones CTA (fijos abajo, fuera del scroll)

- Altura: `h-10` → `h-12`.
- Radio: `rounded-lg` → `rounded-xl`.
- WhatsApp: mismo degradado verde y ícono, sombra un poco más marcada en estado hover/tap (ya usa Framer Motion `whileHover`/`whileTap`, se ajustan valores de `scale` si hace falta pero se mantiene el mecanismo).
- Agregar/Quitar de lista: mismo esquema de color (rojo sólido / rojo claro cuando ya está en lista), radios y alturas iguales al botón de WhatsApp.
- Se confirma que el contenedor de CTAs sigue siendo `flex-shrink-0` fuera del `overflow-y-auto`, por lo que quedan siempre visibles sin importar cuánto contenido tenga el modal (requisito explícito del usuario).

### 8. Microinteracciones

- Se mantienen las animaciones Framer Motion existentes (apertura/cierre del modal, badge "En tu lista", hover/tap de botones).
- Transiciones de hover/tap en botones y tarjeta de specs se afinan a 200-250ms donde el valor actual no esté ya en ese rango.
- Opcional, no bloqueante: leve `active:scale-[0.99]` táctil en la tarjeta de specs al tocar en mobile.

## Fuera de alcance

- Layout desktop (`sm:grid-cols-[420px_1fr]` y todo lo que dependa de `sm:`).
- Lógica de negocio: WhatsApp, quote list, variantes, `ConfirmDialog`.
- Modal de producto del admin (`src/pages/admin/modals/ProductModal.tsx`) — es un componente distinto, no se toca.
- Copy/contenido de productos (viene de datos).

## Testing / verificación

- Verificar visualmente en viewport mobile (375×812 y similar) con un producto con specs+características+accesorios (denso) y uno con poco contenido (sparse), para confirmar que los botones siguen siempre visibles y el scroll interno funciona.
- Confirmar que el layout desktop (`sm:` y superior) no cambió visualmente respecto al estado actual.
- Iconos confirmados existentes en la versión instalada de `lucide-react`: `Ruler`, `Weight`, `Zap`, `Box`, `Gauge`, `ShoppingBasket`, `Thermometer`, `ListChecks`, `Power`, `Maximize`.
