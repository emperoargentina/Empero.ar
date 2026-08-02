// src/lib/productosCache.ts
import { supabase } from './supabase'
import type { Producto } from '@/types/producto'

const CACHE_KEY = 'empero_productos_v1'
const TTL_MS    = 30 * 60 * 1000 // 30 minutes

// Columnas que realmente usan las vistas admin que leen de este cache
// (Products, Dashboard, Destacados, FamilyForm, el selector de familias de
// ProductForm) — nunca las specs técnicas (dimensiones, peso, accesorios,
// características, etc.), esas solo se piden al editar un producto puntual
// con su propio fetch en ProductForm. Mantiene el payload liviano.
const LIST_COLUMNS = [
  'id', 'codigo', 'familia_id', 'etiqueta', 'nombre', 'categoria',
  'precio_usd', 'stock', 'disponible', 'destacado', 'destacado_orden',
  'cloudinary_url', 'created_at',
].join(', ')

interface CacheEntry {
  data: Producto[]
  timestamp: number
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry
  } catch {
    return null
  }
}

function writeCache(data: Producto[]) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Storage quota exceeded — ignore, app still works
  }
}

export function invalidateProductosCache() {
  localStorage.removeItem(CACHE_KEY)
}

export function getCacheAge(): number | null {
  const entry = readCache()
  if (!entry) return null
  return Math.floor((Date.now() - entry.timestamp) / 1000 / 60) // minutes
}

async function fetchAndCache(): Promise<{ data: Producto[]; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select(LIST_COLUMNS)
    .order('nombre')

  if (error) return { data: [], error: error.message }

  const productos = (data ?? []) as unknown as Producto[]
  writeCache(productos)
  return { data: productos, error: null }
}

export async function getProductos(force = false): Promise<{
  data: Producto[]
  error: string | null
  fromCache: boolean
}> {
  const cached = readCache()

  // Stale-while-revalidate: si hay algo en cache (aunque esté vencido) se
  // devuelve al instante — nunca se bloquea la carga esperando a la red.
  // Si está vencido, se revalida en segundo plano para que la próxima
  // carga ya tenga datos frescos.
  if (!force && cached) {
    if (Date.now() - cached.timestamp >= TTL_MS) {
      void fetchAndCache()
    }
    return { data: cached.data, error: null, fromCache: true }
  }

  const { data, error } = await fetchAndCache()
  if (error) {
    // Devolvemos el cache viejo si lo hay para que la UI siga siendo útil
    if (cached) return { data: cached.data, error: `${error} (mostrando datos del caché)`, fromCache: true }
    return { data: [], error, fromCache: false }
  }
  return { data, error: null, fromCache: false }
}
