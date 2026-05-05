import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, Plus, X, Settings, Package, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Product } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '@/utils/productImage';
import { whatsappConfig } from '@/data/company';

const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  const imageUrl = product.cloudinary_url ?? getProductImage(product.categoria, 900, 900);
  const enStock = product.modo_disponibilidad === 'en_stock';

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.nombre));
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank');
  };

  // ── Specs ───────────────────────────────────────────────────────
  const specs: { label: string; value: string }[] = [];
  const dim = product.dimensiones_mm as Record<string, number> | null;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto))
    specs.push({ label: 'Dimensiones', value: `${dim.Ancho ?? '—'} × ${dim.Profundidad ?? '—'} × ${dim.Alto ?? '—'} mm` });
  if (product.capacidad)              specs.push({ label: 'Capacidad',   value: product.capacidad });
  if (product.voltaje)                specs.push({ label: 'Voltaje',     value: product.voltaje });
  if (product.peso_kg != null)        specs.push({ label: 'Peso',        value: `${product.peso_kg} kg` });
  if (product.volumen_m3 != null)     specs.push({ label: 'Volumen',     value: `${product.volumen_m3} m³` });
  if (product.motor_rpm != null)      specs.push({ label: 'Motor',       value: `${product.motor_rpm} RPM` });
  if (product.dimensiones_canasto_mm) specs.push({ label: 'Canasto',     value: product.dimensiones_canasto_mm });
  const pot = product.potencias_kw as Record<string, number> | null;
  if (pot?.Total != null)             specs.push({ label: 'Potencia',    value: `${pot.Total} kW` });
  if (pot?.Motor != null)             specs.push({ label: 'Pot. motor',  value: `${pot.Motor} kW` });
  const temp = product.temperaturas_c as Record<string, number> | null;
  if (temp?.Lavado != null)           specs.push({ label: 'T. lavado',   value: `${temp.Lavado} °C` });
  if (temp?.Enjuague != null)         specs.push({ label: 'T. enjuague', value: `${temp.Enjuague} °C` });
  const prog = product.programas as Record<string, number> | null;
  if (prog?.Cantidad != null)         specs.push({ label: 'Programas',   value: `${prog.Cantidad}` });

  const hasSpecs      = specs.length > 0;
  const hasCaract     = (product.caracteristicas_generales?.length ?? 0) > 0;
  const hasAccesorios = (product.accesorios_incluidos?.length ?? 0) > 0;

  const caractLen     = product.caracteristicas_generales?.length ?? 0;
  const accLen        = product.accesorios_incluidos?.length ?? 0;

  // 2-col layout for long bullet lists
  const caractTwoCols = caractLen > 5;
  const accTwoCols    = accLen > 5;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal */}
        <DialogPrimitive.Content
          className="fixed left-1/2 -translate-x-1/2 z-50 outline-none
                     w-[calc(100vw-2rem)]
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                     data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                     duration-200"
          style={{ top: '54%', transform: 'translate(-50%, -50%)', maxWidth: '920px' }}
        >
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
            style={{ height: 'min(84vh, 660px)', display: 'flex', flexDirection: 'column' }}
          >

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border border-[#E8E2D9] text-[#9A8E82] hover:text-[#1A1613] hover:bg-white transition-all duration-150 cursor-pointer shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* ── Grid: image | details ── */}
            <div className="flex flex-col sm:grid sm:grid-cols-[340px_1fr]" style={{ flex: 1, minHeight: 0 }}>

              {/* ── Image panel — fills grid row height automatically ── */}
              <div className="relative bg-[#F0EBE2] h-[180px] sm:h-auto overflow-hidden flex-shrink-0">
                {!imageLoaded && <div className="absolute inset-0 bg-[#E6E0D7] animate-pulse" />}
                <img
                  src={imageUrl}
                  alt={product.nombre}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Availability */}
                <div className="absolute top-3.5 left-3.5">
                  {enStock ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      En stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      Por encargo
                    </span>
                  )}
                </div>

                {/* In-list badge */}
                <AnimatePresence>
                  {isInQuoteList && (
                    <motion.div
                      className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-md"
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

                {/* Category + SKU */}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mb-0.5">
                    {product.categoria}
                  </p>
                  <span className="text-[8px] font-mono text-white/30 tracking-widest">
                    #{product.codigo}
                  </span>
                </div>
              </div>

              {/* ── Details panel ── */}
              <div className="flex flex-col min-h-0 overflow-hidden bg-white">

                {/* Header */}
                <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0EAE2]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-0.5 h-3 rounded-full bg-[#C41B2E]" />
                    <span className="text-[9px] font-bold text-[#C41B2E] uppercase tracking-[0.22em]">
                      {product.categoria}
                    </span>
                  </div>
                  <h2 className="font-semibold text-[#1A1613] text-[15px] leading-snug pr-8">
                    {product.nombre}
                  </h2>
                  {product.codigo && (
                    <p className="text-[9px] font-mono text-[#C0B5A8] tracking-widest mt-0.5">
                      #{product.codigo}
                    </p>
                  )}
                </div>

                {/* Content — grows with product info, scroll only if exceeds max-height */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-3">

                  {/* Description */}
                  {product.description && (
                    <p className="text-[#6B6159] text-[11.5px] leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Specs — row table */}
                  {hasSpecs && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Settings className="w-3 h-3 text-[#C41B2E]" />
                        <span className="text-[8px] font-bold text-[#B0A89E] uppercase tracking-[0.2em]">
                          Especificaciones técnicas
                        </span>
                      </div>
                      <div className="divide-y divide-[#F0EAE2] rounded-xl overflow-hidden border border-[#EBE5DC]">
                        {specs.map((s, i) => (
                          <div
                            key={s.label}
                            className={`flex items-center justify-between px-3 py-1.5 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}
                          >
                            <span className="text-[10.5px] text-[#9A8E82] font-medium">{s.label}</span>
                            <span className="text-[11px] font-semibold text-[#1A1613] text-right ml-3">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Características — checklist */}
                  {hasCaract && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Layers className="w-3 h-3 text-[#C41B2E]" />
                        <span className="text-[8px] font-bold text-[#B0A89E] uppercase tracking-[0.2em]">
                          Características
                        </span>
                      </div>
                      <ul className={caractTwoCols ? 'grid grid-cols-2 gap-x-3 gap-y-1' : 'space-y-1'}>
                        {product.caracteristicas_generales!.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11.5px] text-[#3A3530] leading-snug">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#FFF0F1] border border-[#F5C5C9] flex items-center justify-center flex-shrink-0 mt-[1px]">
                              <Check className="w-2 h-2 text-[#C41B2E]" strokeWidth={2.5} />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Accesorios */}
                  {hasAccesorios && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Package className="w-3 h-3 text-[#C41B2E]" />
                        <span className="text-[8px] font-bold text-[#B0A89E] uppercase tracking-[0.2em]">
                          Accesorios incluidos
                        </span>
                      </div>
                      <ul className={accTwoCols ? 'grid grid-cols-2 gap-x-3 gap-y-1' : 'space-y-1'}>
                        {product.accesorios_incluidos!.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11.5px] text-[#3A3530] leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C41B2E] flex-shrink-0 mt-[4px]" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!hasSpecs && !hasCaract && !hasAccesorios && !product.description && (
                    <p className="text-[12px] text-[#C0B5A8] italic text-center py-6">
                      Consultá por especificaciones técnicas.
                    </p>
                  )}
                </div>

                {/* ── CTAs — side by side ── */}
                <div className="flex-shrink-0 px-5 py-3 border-t border-[#EBE5DC] bg-[#FAFAF8]">
                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #25d366 0%, #1da851 100%)',
                        boxShadow: '0 4px 14px rgba(37,211,102,0.28)',
                      }}
                      onClick={handleWhatsApp}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <WhatsAppSVG />
                      WhatsApp
                    </motion.button>

                    <motion.button
                      className={`flex-1 h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer border ${
                        isInQuoteList
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-[#1A1613] border-[#E0D9D0] hover:border-[#C41B2E] hover:text-[#C41B2E] hover:bg-[#FFF8F8]'
                      }`}
                      onClick={() => !isInQuoteList && onAddToQuote?.(product)}
                      whileHover={isInQuoteList ? {} : { scale: 1.015 }}
                      whileTap={isInQuoteList ? {} : { scale: 0.97 }}
                    >
                      {isInQuoteList
                        ? <><Check className="w-3.5 h-3.5" /> En tu lista</>
                        : <><Plus className="w-3.5 h-3.5" /> Agregar a lista</>
                      }
                    </motion.button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
