// src/lib/categoriaIcons.tsx
import {
  Shield, Flame, CookingPot, Truck, ChefHat, Droplet, Microwave, Waves,
  Table2, Snowflake, UtensilsCrossed, Square, LayoutGrid, type LucideIcon,
} from 'lucide-react'
import type { Categoria } from '@/types/producto'

export const CATEGORIA_ICONS: Record<Categoria, LucideIcon> = {
  Acero: Shield,
  Cocinas: Flame,
  Cucipastas: CookingPot,
  Distribución: Truck,
  Elaboración: ChefHat,
  Freidoras: Droplet,
  Hornos: Microwave,
  Lavado: Waves,
  Mesas: Table2,
  Parrillas: Flame,
  Planchas: Square,
  Refrigeración: Snowflake,
  Servicio: UtensilsCrossed,
  Superficies: LayoutGrid,
}
