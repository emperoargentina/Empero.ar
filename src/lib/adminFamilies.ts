// src/lib/adminFamilies.ts
import type { Producto } from '@/types/producto'

export interface FamilyOption {
  familia_id: string
  nombre: string
  count: number
}

export function buildFamilyOptions(products: Producto[]): FamilyOption[] {
  const map = new Map<string, { nombre: string; count: number }>()
  for (const p of products) {
    if (!p.familia_id) continue
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
  familiaId: string | null
  variants: Producto[]
}

export function groupProductosByFamily(products: Producto[]): FamilyGroup[] {
  const map = new Map<string, Producto[]>()
  const order: string[] = []
  for (const p of products) {
    const key = p.familia_id ?? p.nombre.trim().toLowerCase()
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(p)
  }
  return order.map(key => {
    const variants = map.get(key)!
    return { key, familiaId: variants[0].familia_id, variants }
  })
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
