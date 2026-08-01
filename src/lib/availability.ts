// La disponibilidad se deriva del stock: si hay unidades → en stock,
// si no → por encargo. No existe el estado "sin stock".

export type Disponibilidad = 'en_stock' | 'por_encargo'

export function disponibilidadDeStock(stock: number): Disponibilidad {
  return stock > 0 ? 'en_stock' : 'por_encargo'
}
