import type { Product } from '@/data/products';

export interface ProductGroup {
  key: string;
  variants: Product[];
}

export function variantLabel(p: Product): string {
  if (p.capacidad) return p.capacidad;
  const dim = p.dimensiones_mm as Record<string, number> | null;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto)) {
    return `${dim.Ancho ?? '—'}×${dim.Profundidad ?? '—'}×${dim.Alto ?? '—'} mm`;
  }
  return p.codigo;
}

export function groupProducts(products: Product[]): ProductGroup[] {
  const map = new Map<string, Product[]>();
  const order: string[] = [];

  for (const p of products) {
    const key = (p.nombre ?? '').trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(p);
  }

  return order.map(key => ({ key, variants: map.get(key)! }));
}
