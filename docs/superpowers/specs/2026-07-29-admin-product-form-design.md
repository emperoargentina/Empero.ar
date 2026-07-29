# Admin: página de creación/edición de productos (inspirada en Patagonia Ultra Bike)

## Contexto

El panel admin de Empero (`/admin/productos`) crea y edita productos con un modal (`ProductModal.tsx`) sobre el listado. El panel admin de Patagonia Ultra Bike (proyecto de referencia, `CODIGO/patagoniaultrabike`) edita sus carreras en páginas dedicadas (`/admin/races/new`, `/admin/races/[id]`) con `RaceForm.tsx`: tabs compactos con ícono, campos agrupados en cards, upload de imágenes por drag&drop con barra de progreso, y una barra de guardado fija.

Se adapta ese layout y esos patrones visuales a la creación/edición de productos de Empero, usando la paleta y el modelo de datos propios de Empero (tabla `products` en Supabase, tipo `Producto`).

## Alcance

- Migrar de modal a páginas dedicadas: `/admin/productos/nuevo` y `/admin/productos/:id`.
- Reestilizar el formulario con el lenguaje visual de `RaceForm` (tabs con ícono, cards, labels uppercase, toggle iOS, barra de guardado fija) pero con la paleta de Empero.
- Reemplazar el campo de URL manual de imagen por un upload real a Cloudinary (drag&drop, barra de progreso), vía un nuevo endpoint firmado. Sin biblioteca de imágenes (fuera de alcance).
- Se mantienen los 4 tabs del formulario actual (Básico, Imagen, Físico, Técnico) y el schema `zod` existente sin cambios de validación.

## Arquitectura

### Rutas (`src/pages/admin/AdminRoot.tsx`)

Se agregan dos rutas nuevas dentro del `<Route element={<AdminPanel ...>}>` existente:

```
productos/nuevo   → ProductForm (modo creación)
productos/:id     → ProductForm (modo edición)
```

`productos` (listado) se mantiene igual.

### Listado (`src/pages/admin/views/Products.tsx`)

- El botón "Agregar producto" navega a `/admin/productos/nuevo` en vez de abrir el modal.
- El botón de lápiz y el click en la fila navegan a `/admin/productos/:id` (igual que `RacesPage` en Patagonia).
- Se elimina el estado `modalOpen`/`editing` y el render de `<ProductModal />`.
- El resto del listado (búsqueda, filtros, badges de stock, scroll infinito, resumen) no cambia.

### `ProductModal.tsx`

Se elimina. Su lógica de formulario (schema `zod`, `toForm`/`fromForm`, tabs, campos) se traslada a `ProductForm.tsx`, adaptada a layout de página completa.

### `ProductForm.tsx` (nuevo — `src/pages/admin/views/ProductForm.tsx`)

Página completa, estructura:

1. **Header**: botón volver (← a `/admin/productos`) + título (`Nuevo producto` / nombre del producto en edición) + código del producto como subtítulo si edita.
2. **Tabs compactos con ícono** (mismo patrón que `RaceForm`): Básico / Imagen / Físico / Técnico. Tab activo con fondo sólido rojo marca (`#C41B2E`) y sombra, en vez del cyan de Patagonia.
3. **Contenido por tab**, agrupado en cards `rounded-xl` con borde suave (`#EBE5DC`), replicando la agrupación de `RaceForm`:
   - **Básico**: card "Identidad" (nombre, código, etiqueta, familia_id, categoría) + card "Precio y stock" (precio_usd, stock, modo_disponibilidad, toggle disponible).
   - **Imagen**: card única con `ImageUpload` (drag&drop) + preview + los campos `cloudinary_url`/`cloudinary_image_id` autocompletados (editables a mano si hace falta).
   - **Físico**: fieldset "Dimensiones externas" (ancho/profundidad/alto/alto_min/alto_max) + card peso/volumen + card capacidad/dimensiones_canasto_mm. Mismo agrupamiento que ya existe en el modal actual, solo remaquetado en cards.
   - **Técnico**: card potencia/consumo_gas/rejilla + textarea accesorios + textarea características.
4. **Barra de guardado fija** al pie: "* Campos obligatorios" + botón "Crear producto" / "Guardar cambios" con spinner mientras `isSubmitting`.

Componentes de layout reutilizados/creados (inline en el archivo o en `src/components/admin/`):
- `Label` (caption uppercase, como en `RaceForm`)
- `Hint` (texto de ayuda gris debajo del campo)
- `Grid`/`Span2` (grillas de 2 columnas para campos relacionados)
- Los inputs conservan las clases Tailwind ya usadas en Empero (`inputCls`), no se reinventan.

### `ImageUpload.tsx` (nuevo — `src/components/admin/ImageUpload.tsx`)

Adaptado de `FileUpload.tsx` de Patagonia, sin el modal de biblioteca:
- Zona de drag&drop + click-to-upload, con preview de la imagen actual y botón para quitarla.
- Barra de progreso durante la subida (XHR con `upload.onprogress`).
- Al soltar/seleccionar un archivo: `POST /api/upload` con `FormData` (incluye `Authorization: Bearer <access_token>` de la sesión Supabase activa).
- Respuesta `{ url, public_id }` → autocompleta `cloudinary_url` y `cloudinary_image_id` en el form.
- Validación de tamaño en cliente (máx 10MB) y tipos aceptados (jpg/png/webp/gif/svg), igual que Patagonia.
- Colores: acento rojo marca en vez de cyan.

### `api/upload.ts` (nuevo, edge function — mismo patrón que `products.ts`/`revalidate.ts`)

1. Valida método `POST` y `Content-Type: multipart/form-data`.
2. Lee el header `Authorization: Bearer <token>` y valida la sesión llamando a `supabase.auth.getUser(token)` (cliente Supabase con `SUPABASE_SERVICE_KEY`). Sin sesión válida → `401`.
3. Lee el archivo del `FormData` (`req.formData()`, soportado nativamente en edge runtime).
4. Verifica tamaño (≤10MB) y tipo MIME (imagen).
5. Firma la subida a Cloudinary sin SDK de Node (no compatible con edge runtime): calcula `timestamp`, arma `folder=empero/productos&timestamp=<ts>` + `CLOUDINARY_API_SECRET`, firma con `crypto.subtle.digest('SHA-1', ...)` (Web Crypto, disponible en edge runtime) y lo pasa a hex.
6. Reenvía `POST` a `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload` con `FormData` (`file`, `api_key`, `timestamp`, `folder`, `signature`).
7. Devuelve `{ url: secure_url, public_id }` al cliente. Errores de Cloudinary o de red → `500` con mensaje.

No se agregan dependencias nuevas (usa `fetch`, `FormData` y `crypto.subtle`, todos disponibles en el edge runtime de Vercel).

## Flujo de datos

- **Crear**: `ProductForm` sin `id` en la URL → formulario vacío con defaults actuales (`stock: 0`, `disponible: true`, `modo_disponibilidad: 'en_stock'`) → submit hace `supabase.from('products').insert()` → toast de éxito → `navigate('/admin/productos')`.
- **Editar**: `ProductForm` con `:id` → al montar, `supabase.from('products').select('*').eq('id', id).single()` → si no existe, mensaje "Producto no encontrado" + botón volver → si existe, precarga el form con `toForm()` (misma función que hoy) → submit hace `update()` → toast de éxito → `navigate('/admin/productos')`.
- El schema `zod` y las funciones `toForm`/`fromForm` se mueven tal cual desde `ProductModal.tsx`, sin cambios de validación.

## Manejo de errores

- Producto inexistente al editar (id inválido o borrado): mensaje de error + botón volver, sin renderizar el form.
- Falla de upload (archivo muy grande, red, error de Cloudinary): mensaje inline debajo del drop zone, no bloquea el resto del formulario ni pierde los demás campos.
- Falla al guardar (`insert`/`update` de Supabase): toast de error (`sonner`, ya usado en el proyecto), el usuario permanece en el form sin perder los datos ingresados.
- Sesión vencida al subir imagen: `api/upload.ts` responde `401`, el cliente muestra "Sesión expirada, volvé a iniciar sesión".

## Estilo

Se reusa la paleta ya definida en Empero — no se importa la de Patagonia:

| Uso | Empero | (Patagonia, no se usa) |
|---|---|---|
| Acento / tab activo | `#C41B2E` | `#2ea2cc` |
| Texto principal | `#1A1613` | `#0f172a` |
| Texto secundario | `#9E9080` | `#94a3b8` |
| Borde | `#EBE5DC` | `#e2e8f0` |
| Fondo superficie 2 | `#FAF8F4` | `#f8fafc` |

Patrones visuales adoptados de `RaceForm`/`FileUpload`: tabs compactos con ícono, cards `rounded-xl` con borde suave agrupando campos, `Label` uppercase + `Hint`, toggle estilo iOS, drop zone con barra de progreso, barra de guardado fija con mensaje de campos obligatorios.

## Fuera de alcance

- Biblioteca de imágenes para reutilizar uploads previos (requeriría tabla `media` nueva en Supabase).
- Cambios al schema de validación `zod` o a los campos del modelo `Producto`.
- Cambios al listado más allá de la navegación (filtros, badges, scroll infinito quedan igual).
