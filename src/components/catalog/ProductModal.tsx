import { Check, Plus, X, Zap, Weight, Ruler, Thermometer, Settings, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Product } from '@/data/products';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '@/utils/productImage';
import { whatsappConfig } from '@/data/company';

const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface SpecRowProps { label: string; value: string }
function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-[#F4F0E8] last:border-0">
      <span className="text-[11px] text-[#9E9080] font-medium flex-shrink-0">{label}</span>
      <span className="text-[12px] text-[#1A1613] font-semibold text-right">{value}</span>
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToQuote?: (product: Product) => void;
  isInQuoteList?: boolean;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToQuote,
  isInQuoteList = false,
}: ProductModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) setImageLoaded(false);
  }, [isOpen, product?.id]);

  if (!product) return null;

  const imageUrl = product.cloudinary_url ?? getProductImage(product.categoria, 900, 1200);
  const enStock = product.modo_disponibilidad === 'en_stock';

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.nombre));
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank');
  };

  // Build technical specs — only include fields with data
  const specs: { label: string; value: string }[] = [];

  const dim = product.dimensiones_mm as Record<string, number> | null;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto)) {
    const parts = [
      dim.Ancho ? `${dim.Ancho}` : '—',
      dim.Profundidad ? `${dim.Profundidad}` : '—',
      dim.Alto ? `${dim.Alto}` : '—',
    ];
    specs.push({ label: 'Dimensiones (mm)', value: `${parts[0]} × ${parts[1]} × ${parts[2]}` });
  }
  if (product.capacidad)            specs.push({ label: 'Capacidad',       value: product.capacidad });
  if (product.voltaje)              specs.push({ label: 'Voltaje',          value: product.voltaje });
  if (product.peso_kg != null)      specs.push({ label: 'Peso',             value: `${product.peso_kg} kg` });
  if (product.volumen_m3 != null)   specs.push({ label: 'Volumen',          value: `${product.volumen_m3} m³` });
  if (product.motor_rpm != null)    specs.push({ label: 'Motor',            value: `${product.motor_rpm} RPM` });
  if (product.dimensiones_canasto_mm) specs.push({ label: 'Canasto',        value: product.dimensiones_canasto_mm });

  const pot = product.potencias_kw as Record<string, number> | null;
  if (pot?.Total != null)           specs.push({ label: 'Potencia total',   value: `${pot.Total} kW` });
  if (pot?.Motor != null)           specs.push({ label: 'Potencia motor',   value: `${pot.Motor} kW` });

  const temp = product.temperaturas_c as Record<string, number> | null;
  if (temp?.Lavado != null)         specs.push({ label: 'Temp. lavado',     value: `${temp.Lavado} °C` });
  if (temp?.Enjuague != null)       specs.push({ label: 'Temp. enjuague',   value: `${temp.Enjuague} °C` });

  const prog = product.programas as Record<string, number> | null;
  if (prog?.Cantidad != null)       specs.push({ label: 'Programas',        value: `${prog.Cantidad}` });

  const hasSpecs       = specs.length > 0;
  const hasCaract      = product.caracteristicas_generales && product.caracteristicas_generales.length > 0;
  const hasAccesorios  = product.accesorios_incluidos && product.accesorios_incluidos.length > 0;
  const hasDetails     = hasSpecs || hasCaract || hasAccesorios;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[96vw] p-0 gap-0 overflow-hidden rounded-2xl border border-[#EBE5DC] shadow-2xl shadow-black/20 bg-white">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-sm border border-[#E8E2D9] text-[#9A8E82] hover:text-[#1A1613] hover:border-[#C0B5A8] transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:grid md:grid-cols-[1fr_1.1fr]" style={{ height: 'min(92vh, 720px)' }}>

          {/* ── Image panel ── */}
          <div className="relative bg-[#F4F0E8] h-[240px] sm:h-[280px] md:h-full overflow-hidden flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#EBE5DC] animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1613]/50 via-transparent to-transparent pointer-events-none" />

            {/* Availability overlay badge */}
            <div className="absolute top-4 left-4">
              <span className={`text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-lg ${
                enStock
                  ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
                  : 'bg-[#1A1613]/70 text-white/90 backdrop-blur-sm'
              }`}>
                {enStock ? 'En stock' : 'Por encargo'}
              </span>
            </div>

            {/* In-list badge */}
            <AnimatePresence>
              {isInQuoteList && (
                <motion.div
                  className="absolute top-4 right-10 md:right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400 text-white rounded-lg text-[9px] font-bold shadow-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                >
                  <Check className="w-3 h-3" />
                  En tu lista
                </motion.div>
              )}
            </AnimatePresence>

            {/* SKU bottom */}
            <div className="absolute bottom-4 left-4">
              <span className="text-[9px] font-mono text-white/40 tracking-widest">
                #{product.codigo}
              </span>
            </div>
          </div>

          {/* ── Details panel ── */}
          <div className="flex flex-col bg-white min-h-0 overflow-hidden">

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto min-h-0">

              {/* Header */}
              <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-[#F0EAE2]">
                <p className="text-[9px] font-bold text-[#C41B2E] uppercase tracking-[0.18em] mb-2">
                  {product.categoria}
                </p>
                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#1A1613] leading-tight pr-8 md:pr-2">
                  {product.nombre}
                </h2>
                {product.precio_usd != null && product.precio_usd > 0 && (
                  <p className="mt-3 text-2xl font-bold text-[#1A1613] tabular-nums">
                    US$ {Number(product.precio_usd).toLocaleString('es-AR')}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="px-6 sm:px-7 py-5 space-y-6">

                {/* Description */}
                {product.description && (
                  <p className="text-[#6B6159] text-sm leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Technical specs */}
                {hasSpecs && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-3.5 h-3.5 text-[#C0B5A8]" />
                      <span className="text-[9px] font-bold text-[#C0B5A8] uppercase tracking-[0.16em]">
                        Especificaciones
                      </span>
                    </div>
                    <div className="bg-[#FAFAF8] border border-[#F0EAE2] rounded-xl px-4 py-1">
                      {specs.map(s => <SpecRow key={s.label} label={s.label} value={s.value} />)}
                    </div>
                  </div>
                )}

                {/* Características */}
                {hasCaract && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="w-3.5 h-3.5 text-[#C0B5A8]" />
                      <span className="text-[9px] font-bold text-[#C0B5A8] uppercase tracking-[0.16em]">
                        Características
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.caracteristicas_generales!.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F4F0] border border-[#EBE5DC] text-[#4A4540] text-[11px] font-medium rounded-lg"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#C41B2E] flex-shrink-0" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accesorios incluidos */}
                {hasAccesorios && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-3.5 h-3.5 text-[#C0B5A8]" />
                      <span className="text-[9px] font-bold text-[#C0B5A8] uppercase tracking-[0.16em]">
                        Accesorios incluidos
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {product.accesorios_incluidos!.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#4A4540]">
                          <span className="w-1 h-1 rounded-full bg-[#C41B2E] flex-shrink-0 mt-2" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!hasDetails && !product.description && (
                  <p className="text-sm text-[#C0B5A8] italic">
                    Consultá por especificaciones técnicas.
                  </p>
                )}
              </div>
            </div>

            {/* ── CTAs ── */}
            <div className="flex-shrink-0 px-6 sm:px-7 py-4 border-t border-[#F0EAE2] bg-[#FAFAF8] space-y-2.5">
              <motion.button
                className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #25d366 0%, #1fbc5c 100%)',
                  boxShadow: '0 2px 16px rgba(37,211,102,0.22)',
                }}
                onClick={handleWhatsApp}
                whileTap={{ scale: 0.97 }}
              >
                <WhatsAppSVG />
                Consultar por WhatsApp
              </motion.button>

              <motion.button
                className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer border ${
                  isInQuoteList
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-white text-[#1A1613] border-[#E8E2D9] hover:border-[#C41B2E] hover:text-[#C41B2E]'
                }`}
                onClick={() => !isInQuoteList && onAddToQuote?.(product)}
                whileTap={isInQuoteList ? {} : { scale: 0.97 }}
              >
                {isInQuoteList
                  ? <><Check className="w-4 h-4" /> Producto en tu lista</>
                  : <><Plus className="w-4 h-4" /> Agregar a mi lista</>
                }
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
