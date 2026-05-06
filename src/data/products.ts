// =============================================================================
// Product Data - Equipamiento Gastronómico Industrial
// =============================================================================

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  description: string | null;
  categoria: string;
  precio_usd: number;
  stock: number;
  disponible: boolean;
  modo_disponibilidad: 'en_stock' | 'por_encargo';
  cloudinary_image_id: string | null;
  cloudinary_url: string | null;
  voltaje: string | null;
  peso_kg: number | null;
  volumen_m3: number | null;
  capacidad: string | null;
  motor_rpm: number | null;
  dimensiones_canasto_mm: string | null;
  dimensiones_mm: Record<string, unknown> | null;
  potencias_kw: Record<string, unknown> | null;
  temperaturas_c: Record<string, unknown> | null;
  programas: Record<string, unknown> | null;
  accesorios_incluidos: string[] | null;
  caracteristicas_generales: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;        // exact value in DB `categoria` column
  name: string;
  shortName: string;
  icon: string;      // lucide icon name
  description: string;
  color: { bg: string; text: string; border: string };
}

// Exact category names as stored in Supabase — must match character-for-character
export const categories: Category[] = [
  {
    id: 'Cocinas', name: 'Cocinas', shortName: 'Cocinas', icon: 'ChefHat',
    description: 'Cocinas industriales y anafes',
    color: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74' },
  },
  {
    id: 'Cucipastas', name: 'Cucipastas', shortName: 'Cucipastas', icon: 'Utensils',
    description: 'Cocedores de pasta industriales',
    color: { bg: '#FFFBEB', text: '#B45309', border: '#FCD34D' },
  },
  {
    id: 'Distribución', name: 'Distribución', shortName: 'Distribución', icon: 'Store',
    description: 'Vitrinas, mostradores y equipos de exhibición',
    color: { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' },
  },
  {
    id: 'Elaboración', name: 'Elaboración', shortName: 'Elaboración', icon: 'Settings2',
    description: 'Procesadoras, amasadoras y equipos de elaboración',
    color: { bg: '#F5F3FF', text: '#6D28D9', border: '#C4B5FD' },
  },
  {
    id: 'Freidoras', name: 'Freidoras', shortName: 'Freidoras', icon: 'Zap',
    description: 'Freidoras eléctricas y a gas',
    color: { bg: '#FFF1F2', text: '#BE123C', border: '#FDA4AF' },
  },
  {
    id: 'Hornos', name: 'Hornos', shortName: 'Hornos', icon: 'Flame',
    description: 'Hornos industriales y profesionales',
    color: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5' },
  },
  {
    id: 'Hornos a Gas', name: 'Hornos a Gas', shortName: 'Hornos a Gas', icon: 'Flame',
    description: 'Hornos a gas bajo mostrador y compactos',
    color: { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  },
  {
    id: 'Lavado', name: 'Lavado', shortName: 'Lavado', icon: 'Droplets',
    description: 'Lavavajillas, lavaderos y equipos de limpieza',
    color: { bg: '#ECFEFF', text: '#0E7490', border: '#67E8F9' },
  },
  {
    id: 'Mesas', name: 'Mesas', shortName: 'Mesas', icon: 'Table2',
    description: 'Mesas de trabajo y preparación',
    color: { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
  },
  {
    id: 'Parrillas', name: 'Parrillas', shortName: 'Parrillas', icon: 'Flame',
    description: 'Parrillas y asadores industriales',
    color: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  },
  {
    id: 'Planchas', name: 'Planchas', shortName: 'Planchas', icon: 'Grid3X3',
    description: 'Planchas industriales y parrillas planas',
    color: { bg: '#FEFCE8', text: '#854D0E', border: '#FDE68A' },
  },
  {
    id: 'Refrigeración', name: 'Refrigeración', shortName: 'Refrigeración', icon: 'Snowflake',
    description: 'Heladeras, freezers y cámaras frigoríficas',
    color: { bg: '#F0F9FF', text: '#0369A1', border: '#7DD3FC' },
  },
  {
    id: 'Superficies', name: 'Superficies', shortName: 'Superficies', icon: 'Layers',
    description: 'Mesadas, estantes y superficies de trabajo',
    color: { bg: '#F9FAFB', text: '#4B5563', border: '#D1D5DB' },
  },
];

export function getCategoryMeta(categoryId: string): Category | undefined {
  return categories.find(c => c.id === categoryId);
}

export { whatsappConfig } from './company';
