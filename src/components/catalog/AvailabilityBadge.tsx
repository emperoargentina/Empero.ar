import { Clock } from 'lucide-react';

interface AvailabilityBadgeProps {
  modo: 'en_stock' | 'por_encargo';
  size?: 'sm' | 'md';
}

export function AvailabilityBadge({ modo, size = 'md' }: AvailabilityBadgeProps) {
  const isMd = size === 'md';
  const base = isMd ? 'pl-2.5 pr-3 py-1 text-[10.5px]' : 'pl-2 pr-2.5 py-0.5 text-[10px]';

  if (modo === 'en_stock') {
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

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-[#FAFAF8] text-[#6B6159] font-semibold uppercase tracking-[0.08em] ${base}`}
      style={{ borderRadius: 2, borderLeft: '2px solid #C41B2E' }}
    >
      <Clock className="w-2.5 h-2.5 text-[#C41B2E] flex-shrink-0" />
      Por Encargo
    </span>
  );
}
