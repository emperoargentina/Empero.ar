import type { Product } from '@/data/products';

export interface ProductGroup {
  key: string;
  variants: Product[];
}

// El nombre propio del hijo es su identidad — es lo que lo distingue como
// variante en el selector del modal. "etiqueta" ("Nombre de Producto hijo")
// permite pisarlo puntualmente si el admin quiere un label más corto.
export function variantLabel(p: Product): string {
  return p.etiqueta?.trim() || p.nombre;
}

export function groupProducts(products: Product[]): ProductGroup[] {
  const map = new Map<string, Product[]>();
  const order: string[] = [];

  for (const p of products) {
    const key = p.familia_id;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(p);
  }

  return order.map(key => ({ key, variants: map.get(key)! }));
}
