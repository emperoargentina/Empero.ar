// src/lib/productosCache.ts
import { supabase } from './supabase'
import type { Producto } from '@/types/producto'

const CACHE_KEY = 'empero_productos_v1'
const TTL_MS    = 30 * 60 * 1000 // 30 minutes

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

export async function getProductos(force = false): Promise<{
  data: Producto[]
  error: string | null
  fromCache: boolean
}> {
  if (!force) {
    const cached = readCache()
    if (cached && Date.now() - cached.timestamp < TTL_MS) {
      return { data: cached.data, error: null, fromCache: true }
    }
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('nombre')

  if (error) {
    // Return stale cache on error so the UI stays useful
    const stale = readCache()
    if (stale) return { data: stale.data, error: `${error.message} (mostrando datos del caché)`, fromCache: true }
    return { data: [], error: error.message, fromCache: false }
  }

  const productos = (data ?? []) as Producto[]
  writeCache(productos)
  return { data: productos, error: null, fromCache: false }
}
