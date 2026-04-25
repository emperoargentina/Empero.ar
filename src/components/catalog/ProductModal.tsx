import { Check, MessageCircle, Plus, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Product } from '@/data/products';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '@/utils/productImage';
import { whatsappConfig } from '@/data/company';

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

  const imageUrl = getProductImage(product.category, 900, 700);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.name));
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-md border-0 shadow-2xl">
        <div className="grid md:grid-cols-[1.1fr_1fr] h-full max-h-[90vh]">

          {/* Image panel */}
          <div className="relative bg-gray-950 min-h-[260px] md:min-h-0 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-900 animate-pulse" />
            )}

            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover opacity-90"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Heavy gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Category — top left */}
            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-sm">
                {product.category}
              </span>
            </div>

            {/* In-list badge */}
            <AnimatePresence>
              {isInQuoteList && (
                <motion.div
                  className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-emerald-400 text-black rounded-sm text-[9px] font-black"
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

            {/* SKU bottom-left */}
            <div className="absolute bottom-4 left-4">
              <span className="text-[9px] font-mono text-white/40 tracking-widest">
                #{product.sku}
              </span>
            </div>
          </div>

          {/* Content panel */}
          <div className="flex flex-col overflow-y-auto max-h-[90vh] bg-white">

            {/* Close */}
            <div className="flex justify-end p-4 pb-0 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-3 flex flex-col flex-1">

              {/* Header */}
              <div className="mb-5">
                <p className="text-[9px] font-black text-[#d32f2f] uppercase tracking-[0.16em] mb-1.5">
                  {product.subcategory}
                </p>
                <h2 className="text-xl md:text-2xl font-black text-gray-950 leading-tight tracking-tight">
                  {product.name}
                </h2>
              </div>

              <div className="h-px bg-gray-100 mb-5" />

              {/* Description */}
              <div className="mb-5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-2">
                  Descripción
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3">
                  Características
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.features.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[11px] font-semibold rounded-sm"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#d32f2f] flex-shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              {/* CTA */}
              <div className="pt-5 border-t border-gray-100 space-y-2">
                <motion.button
                  className={`w-full h-11 rounded-sm text-sm font-black flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer tracking-wide ${
                    isInQuoteList
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'text-white'
                  }`}
                  style={!isInQuoteList ? {
                    background: '#d32f2f',
                    boxShadow: '0 2px 12px rgba(211,47,47,0.25)',
                  } : {}}
                  onClick={() => !isInQuoteList && onAddToQuote?.(product)}
                  whileTap={isInQuoteList ? {} : { scale: 0.97 }}
                  whileHover={!isInQuoteList ? { background: '#b71c1c' } : {}}
                >
                  {isInQuoteList ? (
                    <><Check className="w-4 h-4" /> Producto en tu lista</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Agregar a mi lista</>
                  )}
                </motion.button>

                <motion.button
                  className="w-full h-11 rounded-sm text-sm font-black flex items-center justify-center gap-2 text-white cursor-pointer tracking-wide"
                  style={{
                    background: '#25d366',
                    boxShadow: '0 2px 12px rgba(37,211,102,0.22)',
                  }}
                  onClick={handleWhatsApp}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ background: '#1ebe5d' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar por WhatsApp
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </motion.button>
              </div>

            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
