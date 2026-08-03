// src/lib/categoriaIcons.tsx
import {
  Flame, CookingPot, Truck, ChefHat, Droplet, Microwave, Waves,
  Table2, Snowflake, UtensilsCrossed, Square, LayoutGrid, type LucideIcon,
} from 'lucide-react'
import type { Categoria } from '@/types/producto'

export const CATEGORIA_ICONS: Record<Categoria, LucideIcon> = {
  Bases: LayoutGrid,
  Cocinas: Flame,
  Cucipastas: CookingPot,
  Distribución: Truck,
  Elaboración: ChefHat,
  Freidoras: Droplet,
  Hornos: Microwave,
  Lavado: Waves,
  Mueblería: Table2,
  Parrillas: Flame,
  Planchas: Square,
  Refrigeración: Snowflake,
  Servicio: UtensilsCrossed,
}
