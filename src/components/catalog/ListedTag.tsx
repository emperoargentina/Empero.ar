import { Check } from 'lucide-react';

interface ListedTagProps {
  quantity: number;
  /** compact = solo ✓ y número (para filas angostas, como las variantes del modal). */
  compact?: boolean;
}

// Indicador de "este producto ya está en tu lista": verde suave con check,
// y la cantidad cuando es más de una unidad.
export function ListedTag({ quantity, compact = false }: ListedTagProps) {
  const label = quantity > 1 ? `${quantity} en tu lista` : 'En tu lista';
  return (
    <span className="listed-tag" title={label}>
      <Check aria-hidden="true" strokeWidth={3} />
      {compact ? (
        <>
          {quantity > 1 && <span aria-hidden="true">{quantity}</span>}
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span className="listed-tag__text">{label}</span>
      )}
    </span>
  );
}
