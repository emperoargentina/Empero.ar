// src/types/producto.ts

export interface Producto {
  id: string
  codigo: string
  familia_id: string
  etiqueta: string | null
  nombre: string
  categoria: string
  precio_usd: number | null
  mostrar_precio: boolean
  stock: number
  disponible: boolean
  destacado: boolean
  destacado_orden: number | null
  modo_disponibilidad: 'en_stock' | 'por_encargo'
  cloudinary_image_id: string | null
  cloudinary_url: string | null
  peso_kg: number | null
  volumen_m3: number | null
  capacidad: string | null
  dimensiones_canasto_mm: string | null
  dimensiones_mm: { Ancho?: number; Profundidad?: number; Alto?: number; Alto_min?: number; Alto_max?: number } | null
  potencia_kw: number | null
  consumo_gas_m3h: number | null
  rejilla_mm: string | null
  accesorios_incluidos: string[] | null
  caracteristicas_generales: string[] | null
  // Venta a medida: se fabrica/importa a pedido (no es stock inmediato) —
  // mutuamente excluyente con "producto hijo" (ver ProductForm). Cuando está
  // activo, el modal público muestra `comentario_medida` en vez de las specs.
  venta_a_medida: boolean
  comentario_medida: string | null
  created_at: string
  updated_at: string
}

export type ProductoInsert = Omit<Producto, 'id' | 'created_at' | 'updated_at'>
export type ProductoUpdate = Partial<ProductoInsert>

export const CATEGORIAS = [
  'Acero',
  'Cocinas',
  'Cucipastas',
  'Distribución',
  'Elaboración',
  'Freidoras',
  'Hornos',
  'Lavado',
  'Mesas',
  'Parrillas',
  'Planchas',
  'Refrigeración',
  'Servicio',
  'Superficies',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const LOW_STOCK_THRESHOLD = 5
