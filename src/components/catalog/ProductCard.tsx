import { Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '@/data/products';
import { AvailabilityBadge } from './AvailabilityBadge';

const PLACEHOLDER = '/images/Card/Noimagecard.png';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  isInQuoteList?: boolean;
}

export function ProductCard({
  product,
  onViewDetails,
  onAddToQuote,
  onRemoveFromQuote,
  isInQuoteList = false,
}: ProductCardProps) {
  const imageUrl = product.cloudinary_url ?? PLACEHOLDER;
  const isPlaceholder = !product.cloudinary_url;

  return (
    <article
      className={`group relative cursor-pointer bg-white flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,colors] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(26,22,19,0.12)] ${
        isInQuoteList ? 'border-emerald-300 shadow-emerald-100' : 'border-[#E8E2D9]'
      }`}
      onClick={() => onViewDetails(product)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EAE2] flex-shrink-0">
        <div className="absolute inset-0 z-10 bg-[#1A1613]/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold bg-white/25 px-4 py-1.5 rounded-full border border-white/25">
            <Eye className="w-3 h-3" />
            Ver detalles
          </span>
        </div>

        <img
          src={imageUrl}
          alt={product.nombre}
          width={400}
          height={533}
          className={`w-full h-full ${isPlaceholder ? 'object-contain p-6' : 'object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]'}`}
          loading="lazy"
          decoding="async"
        />

        <div className="absolute bottom-2.5 left-2.5 z-20">
          <AvailabilityBadge modo={product.modo_disponibilidad} size="sm" />
        </div>

        <AnimatePresence>
          {isInQuoteList && (
            <motion.div
              className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
        <p className="product-card-category">
          {product.categoria}
        </p>
        <h3 className="product-card-title">
          {product.nombre}
        </h3>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EAE2] gap-2">
          <span className="product-card-code truncate flex-1">
            {product.codigo}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isInQuoteList) onRemoveFromQuote?.(product.id);
              else onAddToQuote?.(product);
            }}
            aria-label={isInQuoteList ? `Quitar ${product.nombre} de la lista` : `Agregar ${product.nombre}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all duration-150 cursor-pointer ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                : 'bg-[#C41B2E] text-white hover:bg-[#B51426] shadow-sm shadow-red-900/15'
            }`}
          >
            {isInQuoteList ? (
              <><Check className="w-3 h-3" /> En lista</>
            ) : (
              'Agregar'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
