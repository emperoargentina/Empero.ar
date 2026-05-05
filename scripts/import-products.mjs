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
const products = JSON.parse(raw)

console.log(`📦  ${products.length} productos encontrados en Products.json`)

// ── Mapear campos del JSON al schema de Supabase ─────────────────────────────
function mapProduct(p) {
  return {
    id:                        p.id,
    codigo:                    p.Codigo,
    nombre:                    p.Nombre,
    categoria:                 p.Categoria,
    precio_usd:                p.Precio_USD ?? null,
    stock:                     p.stock ?? 0,
    modo_disponibilidad:       p.modo_disponibilidad ?? 'por_encargo',
    disponible:                true,
    cloudinary_image_id:       null,
    cloudinary_url:            p.cloudinary_url ?? null,
    voltaje:                   p.Voltaje ?? null,
    peso_kg:                   p.Peso_kg ?? null,
    volumen_m3:                p.Volumen_m3 ?? null,
    capacidad:                 p.Capacidad ?? null,
    motor_rpm:                 p.Motor_RPM ?? null,
    dimensiones_canasto_mm:    p.Dimensiones_Canasto_mm ?? null,
    dimensiones_mm:            p.Dimensiones_mm ?? null,
    potencias_kw:              p.Potencias_kW ?? null,
    temperaturas_c:            p.Temperaturas_C ?? null,
    programas:                 p.Programas ?? null,
    accesorios_incluidos:      p.Accesorios_Incluidos ?? null,
    caracteristicas_generales: p.Caracteristicas_Generales ?? [],
  }
}

// ── Importar en batches de 50 ────────────────────────────────────────────────
const BATCH_SIZE = 50
const mapped = products.map(mapProduct)
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
    console.log(`✅  ${imported}/${mapped.length} productos importados...`)
  }
}

console.log('\n─────────────────────────────────────────')
console.log(`✅  Importación completa: ${imported} productos`)
if (errors > 0) console.log(`⚠️   ${errors} batches con errores`)
console.log('─────────────────────────────────────────')
