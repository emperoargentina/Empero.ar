import type { Product } from '@/data/products';

export interface ProductGroup {
  key: string;
  variants: Product[];
}

export function variantLabel(p: Product): string {
  if (p.etiqueta) return p.etiqueta;
  if (p.capacidad) return p.capacidad;
  const dim = p.dimensiones_mm;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto || dim.Alto_min)) {
    const alto = dim.Alto ?? (dim.Alto_min != null && dim.Alto_max != null ? `${dim.Alto_min}–${dim.Alto_max}` : '—');
    return `${dim.Ancho ?? '—'}×${dim.Profundidad ?? '—'}×${alto} mm`;
  }
  return p.codigo;
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
