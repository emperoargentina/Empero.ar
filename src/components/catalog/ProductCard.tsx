import { Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '@/data/products';
import { getProductImage } from '@/utils/productImage';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToQuote?: (product: Product) => void;
  isInQuoteList?: boolean;
}

export function ProductCard({
  product,
  onViewDetails,
  onAddToQuote,
  isInQuoteList = false,
}: ProductCardProps) {
  const imageUrl = product.cloudinary_url ?? getProductImage(product.categoria, 600, 800);
  const enStock = product.modo_disponibilidad === 'en_stock';

  return (
    <motion.article
      className={`group relative cursor-pointer bg-white flex flex-col overflow-hidden rounded-2xl border transition-colors duration-200 ${
        isInQuoteList ? 'border-emerald-300 shadow-sm shadow-emerald-100' : 'border-[#E8E2D9]'
      }`}
      onClick={() => onViewDetails(product)}
      whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(26,22,19,0.13)' }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      {/* Image — portrait */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F0E8] flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.nombre}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Hover gradient + pill */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1613]/65 via-[#1A1613]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold tracking-wide bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/25">
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </span>
        </div>

        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          {enStock ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-900/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
              En stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm shadow-amber-900/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
              Por encargo
            </span>
          )}
        </div>

        {/* In-quote dot */}
        <AnimatePresence>
          {isInQuoteList && (
            <motion.div
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md"
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
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4">
        {/* Category */}
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#C41B2E] mb-1.5 truncate">
          {product.categoria}
        </p>

        {/* Name — DM Sans for legibility */}
        <h3 className="font-sans font-medium text-[#1A1613] text-[13px] sm:text-sm leading-snug line-clamp-3 flex-1 min-h-[3.75em]">
          {product.nombre}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EAE2] gap-2">
          <span className="text-[9px] font-mono text-[#C0B5A8] tracking-wider truncate flex-1">
            {product.codigo}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isInQuoteList) onAddToQuote?.(product);
            }}
            disabled={isInQuoteList}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
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
    </motion.article>
  );
}
