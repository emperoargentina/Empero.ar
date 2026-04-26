# Product Catalog — Supabase + Cloudinary Design

**Date:** 2026-04-26  
**Project:** Empero.ar

## Context

Vite + React SPA (no SSR). ~700 productos de equipamiento gastronómico industrial. Imágenes subidas a Cloudinary. Datos gestionados por una persona no-técnica. Deploy en Vercel o Netlify.

## Architecture

```
Vite SPA → Supabase (product data, anon key read-only)
         → Cloudinary (images, URL auto-generated from product id)
         → Vercel/Netlify (hosting)
```

## Data Source

`Products.json` (root del proyecto) es la fuente de verdad inicial con 101 productos reales. Se importa a Supabase una sola vez via script. Nuevos productos se agregan directamente desde el dashboard de Supabase.

## Supabase Schema

Tabla: `products`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text PRIMARY KEY | ej: `emp-1000-f` |
| `codigo` | text | ej: `EMP.1000-F` |
| `nombre` | text NOT NULL | |
| `categoria` | text NOT NULL | |
| `voltaje` | text | nullable |
| `precio_usd` | numeric | nullable |
| `peso_kg` | numeric | nullable |
| `volumen_m3` | numeric | nullable |
| `capacidad` | text | nullable |
| `dimensiones_mm` | jsonb | `{Ancho, Profundidad, Alto}` |
| `potencias_kw` | jsonb | `{Total, Motor, Calentamiento_Tanque, Calentador_Boiler, Maxima}` |
| `motor_rpm` | integer | nullable |
| `temperaturas_c` | jsonb | `{Lavado, Enjuague}` |
| `programas` | jsonb | `{Cantidad, Tiempos_segundos[]}` |
| `dimensiones_canasto_mm` | text | nullable |
| `accesorios_incluidos` | text[] | nullable |
| `caracteristicas_generales` | text[] | nullable |
| `created_at` | timestamptz | DEFAULT now() |

Row Level Security: tabla pública de solo lectura (anon key puede SELECT, no INSERT/UPDATE/DELETE).

## Cloudinary Convention

- **Folder:** `empero/products/`
- **Nombre del archivo:** `{product-id}.jpg` — ej: `emp-1000-f.jpg`
- **URL construida en código:**
  ```
  https://res.cloudinary.com/{CLOUD_NAME}/image/upload/w_800,q_auto,f_auto/empero/products/{id}
  ```
- Sin necesidad de guardar URLs en la BD — se generan automáticamente.
- Si la imagen no existe en Cloudinary, el app muestra un placeholder (no rompe nada).

## Files Changed / Created

### New files

| Archivo | Propósito |
|---|---|
| `src/lib/supabase.ts` | Supabase client (singleton, anon key) |
| `src/lib/cloudinary.ts` | `getProductImageUrl(id, options?)` — construye URL con transformaciones |
| `src/types/product.ts` | Interface `Product` basada en esquema real |
| `scripts/import-products.ts` | Script one-time: lee `Products.json`, upserta en Supabase |

### Modified files

| Archivo | Cambio |
|---|---|
| `src/hooks/useProducts.ts` | Refactor: fetch async desde Supabase en lugar de import estático |
| `src/utils/productImage.ts` | Eliminado — reemplazado por `src/lib/cloudinary.ts` |
| `src/data/products.ts` | Eliminado — datos vienen de Supabase |
| `.env.local` | Agregar vars de Supabase y Cloudinary |

### Components

Los componentes existentes (`ProductCard`, `ProductModal`, `SearchFilters`, etc.) reciben la nueva interface `Product` — cambios mínimos en props. El hook `useProducts` mantiene la misma API pública hacia los componentes.

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
```

Todas con prefijo `VITE_` para exponerlas al cliente (datos públicos de solo lectura).

## Non-Technical Workflow (día a día)

1. Sacar foto del producto
2. Subirla a Cloudinary en la carpeta `empero/products/` con nombre `{id}.jpg`
3. Ir al dashboard de Supabase → tabla `products` → agregar fila con los datos
4. Aparece en el sitio sin tocar código ni hacer redeploy

## Import Script Behavior

`scripts/import-products.ts`:
- Lee `Products.json` del root
- Mapea campos (capitalización del JSON → snake_case de Supabase)
- Hace `upsert` (insert or update by `id`) — seguro de correr múltiples veces
- Reporta cuántos productos se importaron / fallaron

## Deployment

- Vercel (recomendado) o Netlify
- Variables de entorno configuradas en el dashboard del proveedor
- Auto-deploy en cada `git push` a `main`
