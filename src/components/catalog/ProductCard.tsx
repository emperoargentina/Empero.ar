import { Check, Plus, Eye } from 'lucide-react';
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
  const imageUrl = getProductImage(product.category, 400, 300);

  return (
    <motion.article
      className="group relative cursor-pointer bg-white rounded-xl border border-[#E8E2D9] overflow-hidden"
      onClick={() => onViewDetails(product)}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(26,22,19,0.10)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F0E8]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Ver detalles overlay */}
        <div className="absolute inset-0 bg-[#1A1613]/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-white text-[11px] font-semibold bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/25 shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </div>
        </div>

        {/* Category chip */}
        <div className="absolute top-2 left-2">
          <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-white/90 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
            {product.category}
          </span>
        </div>

        {/* In-list badge */}
        <AnimatePresence>
          {isInQuoteList && (
            <motion.div
              className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-400 text-black rounded-sm text-[7px] font-bold uppercase tracking-wide"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            >
              <Check className="w-2.5 h-2.5" />
              En lista
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-3.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#C41B2E] mb-1 truncate">
          {product.subcategory || product.category}
        </p>
        <h3 className="font-serif text-sm sm:text-[15px] font-normal text-[#1A1613] line-clamp-2 leading-snug mb-2.5">
          {product.name}
        </h3>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isInQuoteList) onAddToQuote?.(product);
            }}
            disabled={isInQuoteList}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0 ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-500 border border-emerald-200'
                : 'bg-[#1A1613] text-white hover:bg-[#C41B2E]'
            }`}
          >
            {isInQuoteList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
