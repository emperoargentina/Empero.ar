import type { Product } from '@/data/products'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const FETCH_TIMEOUT_MS = 8000

export async function fetchAvailableProducts(): Promise<Product[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Faltan las variables de entorno de Supabase. Revisá tu .env.local\n' +
      'Necesitás VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    )
  }

  const url = `${SUPABASE_URL}/rest/v1/products?select=*&disponible=eq.true&order=nombre.asc`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Error ${res.status} al cargar productos`)
    }

    return await res.json()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al cargar productos. Revisá tu conexión.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
