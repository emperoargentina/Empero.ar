import { categories } from '@/data/products';

const row1 = [
  ...categories.map(c => c.name),
  '784 Productos',
  'Garantía Certificada',
  'Fabricación Nacional',
  'Entrega Inmediata',
];

const row2 = [
  'Equipamiento Profesional',
  'Cocinas Industriales',
  'Más de 20 años',
  '5000+ Clientes',
  ...categories.slice(0, 8).map(c => c.name),
];

function TrackItem({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-4 px-4">
      <span className="w-1 h-1 rounded-full bg-[#d32f2f] flex-shrink-0" />
      <span>{text}</span>
    </span>
  );
}

function Track({ items, direction }: { items: string[]; direction: 'left' | 'right' }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className={`flex flex-nowrap whitespace-nowrap will-change-transform ${
        direction === 'left' ? 'marquee-left' : 'marquee-right'
      }`}
    >
      {doubled.map((item, i) => (
        <TrackItem key={i} text={item} />
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="py-5 bg-gray-950 overflow-hidden select-none border-y border-white/[0.04]">
      <div className="mb-3 text-sm font-medium text-white/25 tracking-widest uppercase overflow-hidden">
        <Track items={row1} direction="left" />
      </div>
      <div className="text-xs font-medium text-white/15 tracking-[0.12em] uppercase overflow-hidden">
        <Track items={row2} direction="right" />
      </div>
    </div>
  );
}
