import type { Product } from '@/data/products'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const FETCH_TIMEOUT_MS = 8000

type RawProduct = Omit<Product, 'familia_nombre' | 'familia_categoria' | 'familia_cloudinary_url' | 'familia_cloudinary_image_id' | 'familia_caracteristicas_generales'>

interface FamilyRow {
  id: string
  nombre: string
  categoria: string | null
  cloudinary_url: string | null
  cloudinary_image_id: string | null
  caracteristicas_generales: string[] | null
}

export async function fetchAvailableProducts(): Promise<Product[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Faltan las variables de entorno de Supabase. Revisá tu .env.local\n' +
      'Necesitás VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    )
  }

  // Excluye el pool de "productos hijo" sin asignar (familia_id = "_sin_asignar")
  // — son borradores del admin en tránsito hacia una familia real, nunca deben
  // filtrarse al catálogo público (y si dos huérfanos no relacionados quedaran
  // visibles, se agruparían entre sí por compartir el mismo familia_id sentinela).
  const productsUrl = `${SUPABASE_URL}/rest/v1/products?select=*&disponible=eq.true&familia_id=neq._sin_asignar&order=nombre.asc`
  // Nombre/categoría/imagen del grupo se muestran desde la familia, no desde
  // el producto hijo — cada hijo conserva su propia identidad (ver adminFamilies.ts).
  const familiesUrl = `${SUPABASE_URL}/rest/v1/product_families?select=id,nombre,categoria,cloudinary_url,cloudinary_image_id,caracteristicas_generales`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    }
    const [productsRes, familiesRes] = await Promise.all([
      fetch(productsUrl, { headers, signal: controller.signal }),
      fetch(familiesUrl, { headers, signal: controller.signal }),
    ])

    if (!productsRes.ok) {
      throw new Error(`Error ${productsRes.status} al cargar productos`)
    }
    if (!familiesRes.ok) {
      throw new Error(`Error ${familiesRes.status} al cargar familias`)
    }

    const [rawProducts, families]: [RawProduct[], FamilyRow[]] = await Promise.all([
      productsRes.json(),
      familiesRes.json(),
    ])

    const familyMap = new Map(families.map(f => [f.id, f]))

    return rawProducts.map(p => {
      const fam = familyMap.get(p.familia_id)
      return {
        ...p,
        familia_nombre: fam?.nombre ?? p.nombre,
        familia_categoria: fam?.categoria ?? p.categoria,
        familia_cloudinary_url: fam?.cloudinary_url ?? p.cloudinary_url,
        familia_cloudinary_image_id: fam?.cloudinary_image_id ?? p.cloudinary_image_id,
        familia_caracteristicas_generales: fam?.caracteristicas_generales ?? null,
      }
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al cargar productos. Revisá tu conexión.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
