interface AvailabilityBadgeProps {
  modo: 'en_stock' | 'por_encargo';
  size?: 'sm' | 'md' | 'lg';
  /** inline = punto + texto, sin caja (para filas de datos). */
  variant?: 'chip' | 'inline';
  /** @deprecated se mantiene por compatibilidad; todas las variantes son chips. */
  pill?: boolean;
}

const LABEL = { en_stock: 'En stock', por_encargo: 'Por encargo' } as const;
// Nombres completos (no armados con template strings) para que Tailwind no los purgue.
const SIZE_CLASS = { sm: 'avail-badge--sm', md: 'avail-badge--md', lg: 'avail-badge--lg' } as const;

// Estado con punto de color + texto (nunca solo color). Verde = entrega
// inmediata desde depósito, ámbar = se importa a pedido.
export function AvailabilityBadge({ modo, size = 'md', variant = 'chip' }: AvailabilityBadgeProps) {
  const inStock = modo === 'en_stock';

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-[0.75rem]' : 'text-[0.8125rem]'} ${inStock ? 'text-emerald-700' : 'text-amber-700'}`}>
        <span aria-hidden="true" className={`avail-dot ${inStock ? 'avail-dot--stock' : 'avail-dot--order'}`} />
        {LABEL[modo]}
      </span>
    );
  }

  return (
    <span className={`avail-badge ${SIZE_CLASS[size]} ${inStock ? 'avail-badge--stock' : 'avail-badge--order'}`}>
      <span aria-hidden="true" className={`avail-dot ${inStock ? 'avail-dot--stock' : 'avail-dot--order'}`} />
      {LABEL[modo]}
    </span>
  );
}
