import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://ujfeannqsiatavnarrhf.supabase.co'
// Reemplazá con tu SERVICE ROLE KEY (no la anon key) — está en Settings > API
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_KEY) {
  console.error('❌  Falta SUPABASE_SERVICE_KEY. Correlo así:')
  console.error('   SUPABASE_SERVICE_KEY=tu_key node scripts/import-products.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Leer el JSON ─────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = readFileSync(join(__dirname, '..', 'Products_final.json'), 'utf-8')
/** @type {Array<{id:string,nombre:string,categoria:string,caracteristicas_generales:string[],variantes:Array<Record<string, unknown>>}>} */
const families = JSON.parse(raw)

const totalVariantes = families.reduce((n, f) => n + f.variantes.length, 0)
console.log(`📦  ${families.length} familias / ${totalVariantes} variantes encontradas en Products_final.json`)

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(codigo) {
  return codigo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Aplanar: una fila por variante, heredando datos de la familia ────────────
// Nota: no incluimos cloudinary_url / cloudinary_image_id acá a propósito —
// así el upsert nunca pisa las imágenes ya cargadas desde el panel admin.
function flatten(family) {
  return family.variantes.map(v => ({
    id:                        slugify(v.codigo),
    codigo:                    v.codigo,
    familia_id:                family.id,
    etiqueta:                  v.etiqueta ?? null,
    nombre:                    family.nombre,
    categoria:                 family.categoria,
    precio_usd:                v.precio_usd ?? null,
    stock:                     v.stock ?? 0,
    modo_disponibilidad:       v.modo_disponibilidad ?? 'por_encargo',
    disponible:                true,
    peso_kg:                   v.peso_kg ?? null,
    volumen_m3:                v.volumen_m3 ?? null,
    capacidad:                 v.capacidad ?? null,
    dimensiones_canasto_mm:    v.canasto_mm ?? null,
    dimensiones_mm:            v.dimensiones_mm ?? null,
    potencia_kw:               v.potencia_kw ?? null,
    consumo_gas_m3h:           v.consumo_gas_m3h ?? null,
    rejilla_mm:                v.rejilla_mm ?? null,
    accesorios_incluidos:      v.accesorios_incluidos ?? null,
    caracteristicas_generales: family.caracteristicas_generales ?? [],
  }))
}

const mapped = families.flatMap(flatten)

const ids = new Set(mapped.map(r => r.id))
if (ids.size !== mapped.length) {
  console.error(`❌  Hay códigos duplicados que generan el mismo id. Abortando.`)
  process.exit(1)
}

// ── Importar en batches de 50 ────────────────────────────────────────────────
const BATCH_SIZE = 50
let imported = 0
let errors   = 0

for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
  const batch = mapped.slice(i, i + BATCH_SIZE)
  const { error } = await supabase
    .from('products')
    .upsert(batch, { onConflict: 'id' })

  if (error) {
    console.error(`❌  Error en batch ${i}–${i + BATCH_SIZE}:`, error.message)
    errors++
  } else {
    imported += batch.length
    console.log(`✅  ${imported}/${mapped.length} variantes importadas...`)
  }
}

// ── Borrar filas huérfanas (SKUs que ya no existen en el JSON) ───────────────
const { data: existing, error: fetchErr } = await supabase.from('products').select('id')
if (fetchErr) {
  console.error('⚠️   No se pudo verificar filas huérfanas:', fetchErr.message)
} else {
  const staleIds = (existing ?? []).map(r => r.id).filter(id => !ids.has(id))
  if (staleIds.length > 0) {
    const { error: delErr } = await supabase.from('products').delete().in('id', staleIds)
    if (delErr) {
      console.error('⚠️   Error borrando filas huérfanas:', delErr.message)
    } else {
      console.log(`🗑️   ${staleIds.length} SKUs descontinuados eliminados`)
    }
  }
}

console.log('\n─────────────────────────────────────────')
console.log(`✅  Importación completa: ${imported} variantes`)
if (errors > 0) console.log(`⚠️   ${errors} batches con errores`)
console.log('─────────────────────────────────────────')
