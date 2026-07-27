import { Clock } from 'lucide-react';

interface AvailabilityBadgeProps {
  modo: 'en_stock' | 'por_encargo';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

export function AvailabilityBadge({ modo, size = 'md', pill = false }: AvailabilityBadgeProps) {
  const base = size === 'lg' ? 'pl-3.5 pr-4 py-2 text-[13px]' : size === 'md' ? 'pl-2.5 pr-3 py-1 text-[10.5px]' : 'pl-2 pr-2.5 py-0.5 text-[10px]';
  const iconSz = size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';

  if (modo === 'en_stock') {
    if (pill) {
      return (
        <span className={`inline-flex items-center gap-1.5 bg-white text-emerald-700 font-semibold uppercase tracking-[0.08em] rounded-full border border-emerald-200 shadow-sm ${base}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          En Stock
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold uppercase tracking-[0.08em] ${base}`}
        style={{ borderRadius: 2, borderLeft: '2px solid #10b981' }}
      >
        <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
        En Stock
      </span>
    );
  }

  if (pill) {
    return (
      <span className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-semibold uppercase tracking-[0.08em] rounded-full border border-amber-300 shadow-sm ${base}`}>
        <Clock className={`${iconSz} text-amber-600 flex-shrink-0`} />
        Por Encargo
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-semibold uppercase tracking-[0.08em] ${base}`}
      style={{ borderRadius: 2, borderLeft: '2px solid #f59e0b' }}
    >
      <Clock className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
      Por Encargo
    </span>
  );
}
