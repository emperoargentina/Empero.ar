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
  const imageUrl = product.cloudinary_url ?? getProductImage(product.categoria, 600, 800);
  const enStock = product.modo_disponibilidad === 'en_stock';

  return (
    <motion.article
      className={`group relative cursor-pointer bg-white flex flex-col overflow-hidden rounded-2xl border transition-colors duration-200 ${
        isInQuoteList ? 'border-emerald-300' : 'border-[#E8E2D9]'
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

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1613]/70 via-[#1A1613]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Ver detalles pill */}
        <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold tracking-wide bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/25">
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </span>
        </div>

        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-md ${
            enStock
              ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
              : 'bg-[#1A1613]/70 text-white/90 backdrop-blur-sm'
          }`}>
            {enStock ? 'En stock' : 'Por encargo'}
          </span>
        </div>

        {/* In-quote indicator */}
        <AnimatePresence>
          {isInQuoteList && (
            <motion.div
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center shadow-sm"
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
      <div className="flex flex-col flex-1 p-4 pt-3.5">
        <h3 className="font-serif text-[#1A1613] text-[15px] sm:text-base leading-snug line-clamp-3 flex-1 min-h-[3.6em]">
          {product.nombre}
        </h3>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EAE2]">
          <span className="text-[9px] font-mono text-[#C0B5A8] tracking-wider truncate mr-2">
            {product.codigo}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isInQuoteList) onAddToQuote?.(product);
            }}
            disabled={isInQuoteList}
            title={isInQuoteList ? 'En tu lista' : 'Agregar a lista'}
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-500 border border-emerald-200'
                : 'bg-[#1A1613] text-white hover:bg-[#C41B2E]'
            }`}
          >
            {isInQuoteList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
