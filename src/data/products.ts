// =============================================================================
// Product Data - Equipamiento Gastronómico Industrial
// 784 productos organizados por categorías
// =============================================================================

// Tipo que refleja exactamente el esquema de la tabla "products" en Supabase
export interface Product {
  id: string;
  codigo: string;
  nombre: string;
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
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

// Categorías principales
export const categories: Category[] = [
  { id: 'lavado', name: 'Lavado', icon: 'Droplets', description: 'Lavavajillas, lavaderos y equipos de limpieza', productCount: 65 },
  { id: 'refrigeracion', name: 'Refrigeración', icon: 'Snowflake', description: 'Heladeras, freezers y cámaras frigoríficas', productCount: 98 },
  { id: 'distribucion', name: 'Distribución y Autoservicio', icon: 'Store', description: 'Vitrinas, mostradores y equipos de exhibición', productCount: 72 },
  { id: 'hornos', name: 'Hornos', icon: 'Flame', description: 'Hornos industriales y profesionales', productCount: 85 },
  { id: 'freidoras', name: 'Freidoras', icon: 'Flame', description: 'Freidoras eléctricas y a gas', productCount: 45 },
  { id: 'planchas', name: 'Planchas', icon: 'Grid3X3', description: 'Planchas industriales y parrillas planas', productCount: 52 },
  { id: 'cocinas', name: 'Cocinas', icon: 'ChefHat', description: 'Cocinas industriales y anafes', productCount: 78 },
  { id: 'parrillas', name: 'Parrillas', icon: 'FlameKindling', description: 'Parrillas y asadores industriales', productCount: 43 },
  { id: 'cucipastas', name: 'Cucipastas', icon: 'Utensils', description: 'Cocedores de pasta industriales', productCount: 28 },
  { id: 'hornos-bajo-mostrador', name: 'Hornos a Gas Bajo Mostrador', icon: ' Oven', description: 'Hornos compactos para mostrador', productCount: 36 },
  { id: 'superficies', name: 'Superficies', icon: 'Table2', description: 'Mesadas, estantes y superficies de trabajo', productCount: 92 },
  { id: 'elaboracion', name: 'Elaboración', icon: 'Cog', description: 'Procesadoras, amasadoras y equipos de elaboración', productCount: 56 },
  { id: 'mesas', name: 'Mesas', icon: 'Table', description: 'Mesas de trabajo y preparación', productCount: 34 },
];

// Subcategorías por categoría
export const subcategories: Record<string, string[]> = {
  lavado: ['Lavavajillas', 'Lavaderos', 'Secadores', 'Dosificadores'],
  refrigeracion: ['Heladeras', 'Freezers', 'Cámaras', 'Mostradores', 'Bajo Mostrador'],
  distribucion: ['Vitrinas', 'Mostradores', 'Self Service', 'Buffet'],
  hornos: ['Hornos Pizza', 'Hornos Panadería', 'Hornos Convector', 'Hornos Mixtos'],
  freidoras: ['Freidoras Eléctricas', 'Freidoras a Gas', 'Freidoras Dobles'],
  planchas: ['Planchas Lisas', 'Planchas Ranuradas', 'Planchas Mixtas'],
  cocinas: ['Cocinas 4 Hornallas', 'Cocinas 6 Hornallas', 'Anafes', 'Cocinas con Horno'],
  parrillas: ['Parrillas a Carbón', 'Parrillas a Gas', 'Parrillas Mixtas'],
  cucipastas: ['Cucipastas Eléctricos', 'Cucipastas a Gas', 'Cocedores'],
  'hornos-bajo-mostrador': ['Hornos Pizza Bajo', 'Hornos Calentadores', 'Hornos Exhibidores'],
  superficies: ['Mesadas', 'Estantes', 'Repisas', 'Superficies Inox'],
  elaboracion: ['Procesadoras', 'Amasadoras', 'Batidoras', 'Cutter'],
  mesas: ['Mesas de Prep', 'Mesas con Estante', 'Mesas con Cajones'],
};

// WhatsApp configuration - Import from company config
export { whatsappConfig } from './company';
