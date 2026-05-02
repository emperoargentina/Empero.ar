// =============================================================================
// Product Data - Equipamiento Gastronómico Industrial
// 784 productos organizados por categorías
// =============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  features: string[];
  image: string;
  sku: string;
  price: number;
  availability: 'en-stock' | 'por-encargo';
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

// Generador de nombres de productos
const productNames: Record<string, string[]> = {
  lavado: [
    'Lavavajillas Industrial', 'Lavavajillas de Arrastre', 'Lavavajillas de Cúpula',
    'Lavadero Simple', 'Lavadero Doble', 'Lavadero Triple', 'Lavadero con Escurridor',
    'Dosificador de Jabón', 'Secador de Vajilla', 'Carro de Transporte'
  ],
  refrigeracion: [
    'Heladera Exhibidora', 'Heladera Bajo Mostrador', 'Heladera Vertical',
    'Freezer Horizontal', 'Freezer Vertical', 'Freezer Exhibidor',
    'Cámara Frigorífica', 'Mostrador Refrigerado', 'Self Service Refrigerado',
    'Vitrina Refrigerada', 'Batea Refrigerada', 'Mesa Fría'
  ],
  distribucion: [
    'Vitrina Caliente', 'Vitrina Refrigerada', 'Vitrina Self Service',
    'Mostrador Caliente', 'Mostrador Frío', 'Mostrador Neutro',
    'Buffet Caliente', 'Buffet Frío', 'Isla de Self Service'
  ],
  hornos: [
    'Horno Pizza a Gas', 'Horno Pizza Eléctrico', 'Horno de Piedra',
    'Horno Panadería', 'Horno Convector', 'Horno Mixto',
    'Horno de Carro', 'Horno Túnel', 'Horno de Pisos'
  ],
  freidoras: [
    'Freidora Eléctrica Simple', 'Freidora Eléctrica Doble', 'Freidora Eléctrica Triple',
    'Freidora a Gas Simple', 'Freidora a Gas Doble', 'Freidora Industrial',
    'Freidora de Alta Recuperación', 'Freidora con Filtro'
  ],
  planchas: [
    'Plancha Lisa Eléctrica', 'Plancha Lisa a Gas', 'Plancha Ranurada',
    'Plancha Mixta', 'Plancha Cromada', 'Plancha con Horno',
    'Plancha Doble', 'Plancha Triple'
  ],
  cocinas: [
    'Cocina 4 Hornallas', 'Cocina 6 Hornallas', 'Cocina 8 Hornallas',
    'Anafe Eléctrico', 'Anafe a Gas', 'Anafe Inducción',
    'Cocina con Horno', 'Cocina Industrial', 'Cocina Wok'
  ],
  parrillas: [
    'Parrilla a Carbón', 'Parrilla a Gas', 'Parrilla Mixta',
    'Parrilla con Plancha', 'Parrilla de Piedra', 'Parrilla Volcánica',
    'Asador Rotativo', 'Parrilla de Contacto'
  ],
  cucipastas: [
    'Cucipasta Eléctrico', 'Cucipasta a Gas', 'Cocedor de Pasta',
    'Hervidor de Agua', 'Baño María Pasta', 'Escurridor de Pasta'
  ],
  'hornos-bajo-mostrador': [
    'Horno Pizza Bajo Mostrador', 'Horno Calentador', 'Horno Exhibidor',
    'Horno de Contacto', 'Horno Rapid', 'Horno Turbo'
  ],
  superficies: [
    'Mesada de Trabajo', 'Mesada con Estante', 'Mesada con Cajones',
    'Estante de Acero', 'Estante Cromado', 'Repisa Inox',
    'Superficie de Prep', 'Mesa de Despiece'
  ],
  elaboracion: [
    'Procesadora de Alimentos', 'Amasadora', 'Batidora Planetaria',
    'Cutter Industrial', 'Licuadora Industrial', 'Peladora de Papas',
    'Ralladora', 'Rebanadora', 'Mezcladora'
  ],
  mesas: [
    'Mesa de Preparación', 'Mesa con Estante', 'Mesa con Cajones',
    'Mesa de Trabajo', 'Mesa de Empaque', 'Mesa Ensambladora'
  ],
};

// Descripciones genéricas
const descriptions = [
  'Equipamiento industrial de alta resistencia fabricado en acero inoxidable AISI 304. Diseñado para uso intensivo en gastronomía profesional.',
  'Solución profesional para su negocio gastronómico. Construcción robusta en acero inoxidable de primera calidad.',
  'Equipo industrial con acabados de primera calidad. Ideal para restaurantes, hoteles y catering.',
  'Diseño ergonómico y funcional. Fabricado con materiales de alta durabilidad para uso profesional.',
  'Equipamiento de última generación para la gastronomía profesional. Alta eficiencia y rendimiento.',
];

// Características comunes
const commonFeatures = [
  'Acero inoxidable AISI 304',
  'Regulador de temperatura',
  'Termostato de precisión',
  'Fácil limpieza',
  'Alta resistencia',
  'Diseño ergonómico',
  'Bajo consumo energético',
  'Certificación IRAM',
  'Garantía 1 año',
  'Repuestos disponibles',
];

// Función para generar SKU
const generateSKU = (category: string, index: number): string => {
  const prefix = category.substring(0, 3).toUpperCase();
  const number = String(index + 1).padStart(4, '0');
  return `${prefix}-${number}`;
};

// Función para generar productos
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let globalIndex = 0;

  categories.forEach((category) => {
    const names = productNames[category.id] || ['Producto Industrial'];
    const subcats = subcategories[category.id] || ['General'];
    
    // Generar productos para esta categoría
    const productsPerCategory = category.productCount;
    
    for (let i = 0; i < productsPerCategory; i++) {
      const nameBase = names[i % names.length];
      const subcategory = subcats[i % subcats.length];
      const variant = Math.floor(i / names.length) + 1;
      const name = variant > 1 ? `${nameBase} ${variant}` : nameBase;
      
      // Seleccionar características aleatorias
      const numFeatures = 3 + Math.floor(Math.random() * 3);
      const shuffledFeatures = [...commonFeatures].sort(() => Math.random() - 0.5);
      const features = shuffledFeatures.slice(0, numFeatures);
      
      // Generate a pseudo-random but deterministic price based on index
      const basePrice = 50000 + ((globalIndex * 37 + 13) % 950000);
      const roundedPrice = Math.round(basePrice / 1000) * 1000;
      const availability: 'en-stock' | 'por-encargo' = (globalIndex % 3 === 0) ? 'por-encargo' : 'en-stock';

      products.push({
        id: `prod-${globalIndex + 1}`,
        name,
        description: descriptions[globalIndex % descriptions.length],
        category: category.name,
        subcategory,
        features,
        image: `/images/products/${category.id}-${(i % 10) + 1}.jpg`,
        sku: generateSKU(category.id, i),
        price: roundedPrice,
        availability,
      });
      
      globalIndex++;
    }
  });

  return products;
};

// Exportar productos generados
export const products: Product[] = generateProducts();

// Funciones de utilidad
export const getProductsByCategory = (categoryId: string): Product[] => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  return products.filter(p => p.category === category.name);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.subcategory.toLowerCase().includes(lowerQuery) ||
    p.sku.toLowerCase().includes(lowerQuery)
  );
};

export const filterProducts = (
  category?: string,
  subcategory?: string
): Product[] => {
  return products.filter(p => {
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });
};

// WhatsApp configuration - Import from company config
export { whatsappConfig } from './company';
