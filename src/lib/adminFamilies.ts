// src/lib/adminFamilies.ts
import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types/producto'
import type { FamilyInsert, FamilyUpdate, ProductFamily } from '@/types/family'

export const SIN_ASIGNAR_ID = '_sin_asignar'

export interface FamilyOption {
  familia_id: string
  nombre: string
  count: number
}

export function buildFamilyOptions(products: Producto[]): FamilyOption[] {
  const map = new Map<string, { nombre: string; count: number }>()
  for (const p of products) {
    if (p.familia_id === SIN_ASIGNAR_ID) continue
    const entry = map.get(p.familia_id)
    if (entry) entry.count += 1
    else map.set(p.familia_id, { nombre: p.nombre, count: 1 })
  }
  return Array.from(map.entries())
    .map(([familia_id, v]) => ({ familia_id, nombre: v.nombre, count: v.count }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// Productos hijo creados con el toggle "Convertir en Producto Hijo" que
// todavía no fueron asignados a ninguna familia real.
export function listUnassignedChildren(products: Producto[]): Producto[] {
  return products.filter(p => p.familia_id === SIN_ASIGNAR_ID)
}

// Familias reales (no la sentinela) sin ningún producto todavía —
// creadas con "Crear Familia", esperando su primer producto hijo.
export function listEmptyFamilies(families: ProductFamily[], products: Producto[]): ProductFamily[] {
  const used = new Set(products.map(p => p.familia_id))
  return families.filter(f => f.id !== SIN_ASIGNAR_ID && !used.has(f.id))
}

export interface FamilyGroup {
  key: string
  familiaId: string
  variants: Producto[]
}

export function groupProductosByFamily(products: Producto[]): FamilyGroup[] {
  const map = new Map<string, Producto[]>()
  const order: string[] = []
  for (const p of products) {
    if (!map.has(p.familia_id)) {
      map.set(p.familia_id, [])
      order.push(p.familia_id)
    }
    map.get(p.familia_id)!.push(p)
  }
  return order.map(familiaId => ({ key: familiaId, familiaId, variants: map.get(familiaId)! }))
}

const DIACRITICS_RE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g',
)

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(DIACRITICS_RE, '')
}

export function slugifyFamilyName(nombre: string): string {
  return stripAccents(nombre)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueFamilyId(nombre: string, existing: Iterable<string>): string {
  const base = slugifyFamilyName(nombre) || 'familia'
  const taken = new Set(existing)
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i += 1
  return `${base}-${i}`
}

export async function listFamilies(): Promise<{ data: ProductFamily[]; error: string | null }> {
  const { data, error } = await supabase.from('product_families').select('*').order('nombre')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as ProductFamily[], error: null }
}

export async function createFamily(payload: FamilyInsert): Promise<{ data: ProductFamily | null; error: string | null }> {
  const { data, error } = await supabase.from('product_families').insert(payload).select().single()
  if (error) return { data: null, error: error.message }
  return { data: data as ProductFamily, error: null }
}

export async function updateFamily(id: string, payload: FamilyUpdate): Promise<{ error: string | null }> {
  const { error } = await supabase.from('product_families').update(payload).eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteFamily(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('product_families').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// "Crear Familia": solo un nombre, sin categoría/imagen/características —
// la categoría se completa recién con el primer producto hijo que se le agregue.
export async function createEmptyFamily(nombre: string): Promise<{ data: ProductFamily | null; error: string | null }> {
  return createFamily({
    nombre,
    categoria: null,
    cloudinary_url: null,
    cloudinary_image_id: null,
    caracteristicas_generales: null,
  })
}

// Asigna productos hijo (del pool "Sin asignar") a una familia real.
// Si la familia todavía no tiene categoría, la toma de `categoria` (la del
// primer lote agregado); todos los productos del lote deben compartirla —
// eso se valida en la UI antes de llamar a esta función.
export async function addChildrenToFamily(
  family: ProductFamily,
  productIds: string[],
  categoria: string,
): Promise<{ error: string | null }> {
  if (!family.categoria) {
    const { error: catError } = await updateFamily(family.id, { categoria })
    if (catError) return { error: catError }
  }
  const { error } = await supabase.from('products').update({ familia_id: family.id }).in('id', productIds)
  return { error: error?.message ?? null }
}
