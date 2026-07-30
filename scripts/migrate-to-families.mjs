// Paso 2 de la migración a familias reales (ver migration-families.sql).
// Agrupa los products existentes por familia_id (si ya lo tenían) o por
// nombre normalizado (último uso de ese fallback, para siempre), crea una
// fila product_families por grupo, y homogeniza familia_id en cada producto.
//
// Correlo así (necesita la tabla/triggers de migration-families.sql ya creados):
//   SUPABASE_SERVICE_KEY=tu_key node scripts/migrate-to-families.mjs
//
// Es seguro correrlo más de una vez: los grupos que ya tienen familia_id
// consistente no generan una familia nueva, reusan la existente.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ujfeannqsiatavnarrhf.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_KEY) {
  console.error('❌  Falta SUPABASE_SERVICE_KEY. Correlo así:')
  console.error('   SUPABASE_SERVICE_KEY=tu_key node scripts/migrate-to-families.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Helpers de slug (misma lógica que src/lib/adminFamilies.ts) ─────────────
const DIACRITICS_RE = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g')

function stripAccents(s) {
  return s.normalize('NFD').replace(DIACRITICS_RE, '')
}

function slugifyFamilyName(nombre) {
  return stripAccents(nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function generateUniqueFamilyId(nombre, existing) {
  const base = slugifyFamilyName(nombre) || 'familia'
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i += 1
  return `${base}-${i}`
}

// ── 1. Traer todos los productos ────────────────────────────────────────────
const { data: products, error: fetchError } = await supabase
  .from('products')
  .select('id, familia_id, nombre, categoria, cloudinary_url, cloudinary_image_id, caracteristicas_generales')

if (fetchError) {
  console.error('❌  Error al leer products:', fetchError.message)
  process.exit(1)
}

console.log(`📦  ${products.length} productos encontrados`)

// ── 2. Agrupar por familia_id existente, o por nombre normalizado ──────────
const groups = new Map() // key -> products[]
for (const p of products) {
  const key = p.familia_id ?? p.nombre.trim().toLowerCase()
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(p)
}

console.log(`🗂️   ${groups.size} familias detectadas`)

// IDs de familia ya en uso (para no colisionar al generar nuevos slugs)
const usedFamilyIds = new Set(
  products.map(p => p.familia_id).filter((v) => Boolean(v))
)

const fieldsToCheck = ['nombre', 'categoria', 'cloudinary_url', 'cloudinary_image_id', 'caracteristicas_generales']
let driftReports = 0
let familiesCreated = 0
let productsUpdated = 0

for (const [key, members] of groups) {
  const hasExistingFamiliaId = members[0].familia_id != null
  const familyId = hasExistingFamiliaId ? members[0].familia_id : generateUniqueFamilyId(members[0].nombre, usedFamilyIds)
  usedFamilyIds.add(familyId)

  // Reporta drift: variantes del mismo grupo con campos "compartidos" distintos.
  const rep = members[0]
  for (const m of members.slice(1)) {
    for (const f of fieldsToCheck) {
      const a = JSON.stringify(rep[f] ?? null)
      const b = JSON.stringify(m[f] ?? null)
      if (a !== b) {
        driftReports += 1
        console.warn(`⚠️   Drift en familia "${key}" campo "${f}": producto ${rep.id}=${a} vs ${m.id}=${b} (se homogeniza con el valor del primero: ${rep.id})`)
      }
    }
  }

  const { error: upsertError } = await supabase
    .from('product_families')
    .upsert(
      {
        id: familyId,
        nombre: rep.nombre,
        categoria: rep.categoria,
        cloudinary_url: rep.cloudinary_url,
        cloudinary_image_id: rep.cloudinary_image_id,
        caracteristicas_generales: rep.caracteristicas_generales,
      },
      { onConflict: 'id' },
    )

  if (upsertError) {
    console.error(`❌  Error al crear familia "${familyId}":`, upsertError.message)
    continue
  }
  familiesCreated += 1

  const memberIds = members.map(m => m.id)
  const { error: updateError } = await supabase
    .from('products')
    .update({ familia_id: familyId })
    .in('id', memberIds)

  if (updateError) {
    console.error(`❌  Error al actualizar familia_id para "${familyId}":`, updateError.message)
    continue
  }
  productsUpdated += memberIds.length
}

console.log(`\n✅  ${familiesCreated} familias creadas/actualizadas`)
console.log(`✅  ${productsUpdated} productos actualizados`)
if (driftReports > 0) {
  console.log(`⚠️   ${driftReports} campos con drift homogeneizados — revisá los warnings de arriba`)
}

// ── 3. Verificación final ───────────────────────────────────────────────────
const { count: nullCount, error: verifyError } = await supabase
  .from('products')
  .select('id', { count: 'exact', head: true })
  .is('familia_id', null)

if (verifyError) {
  console.error('❌  Error al verificar:', verifyError.message)
} else if (nullCount > 0) {
  console.error(`❌  Todavía hay ${nullCount} productos con familia_id null. No corras migration-families-finalize.sql todavía.`)
} else {
  console.log('✅  0 productos con familia_id null — listo para correr migration-families-finalize.sql')
}
