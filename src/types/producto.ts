// src/types/producto.ts

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria: string
  precio_usd: number | null
  stock: number
  disponible: boolean
  modo_disponibilidad: 'en_stock' | 'por_encargo'
  cloudinary_image_id: string | null
  cloudinary_url: string | null
  voltaje: string | null
  peso_kg: number | null
  volumen_m3: number | null
  capacidad: string | null
  motor_rpm: number | null
  dimensiones_canasto_mm: string | null
  dimensiones_mm: { Ancho?: number; Profundidad?: number; Alto?: number } | null
  potencias_kw: Record<string, number> | null
  temperaturas_c: Record<string, number> | null
  programas: { Cantidad?: number; Tiempos_segundos?: number[] } | null
  accesorios_incluidos: string[] | null
  caracteristicas_generales: string[] | null
  created_at: string
  updated_at: string
}

export type ProductoInsert = Omit<Producto, 'id' | 'created_at' | 'updated_at'>
export type ProductoUpdate = Partial<ProductoInsert>

export const CATEGORIAS = [
  'Lavado',
  'Refrigeración',
  'Distribución y Autoservicio',
  'Hornos',
  'Freidoras',
  'Planchas',
  'Cocinas',
  'Parrillas',
  'Cucipastas',
  'Hornos a Gas Bajo Mostrador',
  'Superficies',
  'Elaboración',
  'Mesas',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const LOW_STOCK_THRESHOLD = 5
