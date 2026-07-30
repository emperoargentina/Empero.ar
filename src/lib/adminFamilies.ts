// src/lib/adminFamilies.ts
import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types/producto'
import type { FamilyInsert, FamilyUpdate, ProductFamily } from '@/types/family'

export interface FamilyOption {
  familia_id: string
  nombre: string
  count: number
}

export function buildFamilyOptions(products: Producto[]): FamilyOption[] {
  const map = new Map<string, { nombre: string; count: number }>()
  for (const p of products) {
    const entry = map.get(p.familia_id)
    if (entry) entry.count += 1
    else map.set(p.familia_id, { nombre: p.nombre, count: 1 })
  }
  return Array.from(map.entries())
    .map(([familia_id, v]) => ({ familia_id, nombre: v.nombre, count: v.count }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
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
