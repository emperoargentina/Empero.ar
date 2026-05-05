import { Check, Plus, X } from 'lucide-react';
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

  const imageUrl = product.cloudinary_url ?? getProductImage(product.categoria, 900, 700);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.nombre));
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[96vw] p-0 gap-0 overflow-hidden rounded-2xl border border-[#EBE5DC] shadow-2xl shadow-black/15 bg-white">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-[#E8E2D9] text-[#9A8E82] hover:text-[#1A1613] hover:border-[#C0B5A8] transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Layout: single column mobile, two columns desktop */}
        <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr]" style={{ height: 'min(88vh, 680px)' }}>

          {/* ── Image panel ── */}
          <div className="relative bg-[#F4F0E8] h-[230px] sm:h-[270px] md:h-full overflow-hidden flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#EBE5DC] animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

            {/* Category */}
            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-sm">
                {product.categoria}
              </span>
            </div>

            {/* In-list badge */}
            <AnimatePresence>
              {isInQuoteList && (
                <motion.div
                  className="absolute top-4 right-10 md:right-4 flex items-center gap-1 px-2.5 py-1 bg-emerald-400 text-black rounded-sm text-[9px] font-bold"
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

            {/* SKU */}
            <div className="absolute bottom-3 left-4">
              <span className="text-[9px] font-mono text-white/40 tracking-widest">
                #{product.codigo}
              </span>
            </div>
          </div>

          {/* ── Content panel ── */}
          <div className="flex flex-col overflow-hidden bg-white min-h-0 flex-1">

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-7 pt-6 pb-4 min-h-0">

              {/* Header */}
              <div className="mb-4 pr-8 md:pr-2">
                <p className="text-[9px] font-semibold text-[#C41B2E] uppercase tracking-[0.18em] mb-1.5">
                  {product.categoria}
                </p>
                <h2 className="text-xl md:text-2xl font-serif font-normal text-[#1A1613] leading-tight">
                  {product.nombre}
                </h2>
              </div>

              <div className="h-px bg-[#F0EAE2] mb-4" />

              {/* Availability */}
              <div className="mb-5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${
                  product.modo_disponibilidad === 'en_stock'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    product.modo_disponibilidad === 'en_stock' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {product.modo_disponibilidad === 'en_stock' ? 'En stock' : 'Por encargo'}
                </span>
              </div>

              {/* Description */}
              {product.description && (
              <div className="mb-5">
                <p className="text-[8px] font-semibold text-[#C0B5A8] uppercase tracking-[0.14em] mb-2">
                  Descripción
                </p>
                <p className="text-[#6B6159] text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
              )}

              {/* Features */}
              {product.caracteristicas_generales && product.caracteristicas_generales.length > 0 && (
              <div>
                <p className="text-[8px] font-semibold text-[#C0B5A8] uppercase tracking-[0.14em] mb-2.5">
                  Características
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.caracteristicas_generales.map((f, i) => (
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

            </div>

            {/* ── CTAs ── */}
            <div className="flex-shrink-0 px-6 sm:px-7 py-4 border-t border-[#F0EAE2] bg-white space-y-2.5">

              <motion.button
                className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #25d366 0%, #1fbc5c 100%)',
                  boxShadow: '0 2px 16px rgba(37,211,102,0.25)',
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
                {isInQuoteList ? (
                  <><Check className="w-4 h-4" /> Producto en tu lista</>
                ) : (
                  <><Plus className="w-4 h-4" /> Agregar a mi lista</>
                )}
              </motion.button>

            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
