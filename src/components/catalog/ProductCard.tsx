import { Check, Plus } from 'lucide-react';
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
  const imageUrl = getProductImage(product.category, 400, 520);

  return (
    <motion.article
      className="group relative cursor-pointer overflow-hidden bg-gray-950 rounded-md"
      onClick={() => onViewDetails(product)}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Gradient overlay — stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

      {/* Red accent overlay on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ background: 'linear-gradient(to top, rgba(211,47,47,0.25) 0%, transparent 50%)' }}
      />

      {/* Category tag */}
      <div className="absolute top-2.5 left-2.5">
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {product.category}
        </span>
      </div>

      {/* In-list badge */}
      <AnimatePresence>
        {isInQuoteList && (
          <motion.div
            className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-emerald-400 text-black rounded-sm text-[8px] font-black"
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

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-3">
        <p className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-0.5 truncate">
          {product.subcategory}
        </p>
        <h3 className="font-black text-white text-[12px] leading-snug tracking-tight line-clamp-2 mb-2.5">
          {product.name}
        </h3>

        <button
          className={`w-full py-1.5 rounded-sm text-[10px] font-black tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
            isInQuoteList
              ? 'bg-emerald-400 text-black'
              : 'bg-[#d32f2f] text-white hover:bg-[#b71c1c]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isInQuoteList) onAddToQuote?.(product);
          }}
          disabled={isInQuoteList}
        >
          {isInQuoteList ? (
            <><Check className="w-3 h-3" /> Agregado</>
          ) : (
            <><Plus className="w-3 h-3" /> Agregar</>
          )}
        </button>
      </div>
    </motion.article>
  );
}
