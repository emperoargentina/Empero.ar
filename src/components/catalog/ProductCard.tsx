import { useMemo, useState } from 'react';
import { Check, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '@/data/products';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AvailabilityBadge } from './AvailabilityBadge';
import { disponibilidadDeStock } from '@/lib/availability';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { useShrinkToFit } from '@/hooks/useShrinkToFit';

interface ProductCardProps {
  variants: Product[];
  onViewDetails: (product: Product, variants: Product[]) => void;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  quoteListIds?: string[];
}

export function ProductCard({
  variants,
  onViewDetails,
  onAddToQuote,
  onRemoveFromQuote,
  quoteListIds = [],
}: ProductCardProps) {
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const product = variants[0];
  const hasVariants = variants.length > 1;

  const variantInQuote = useMemo(
    () => variants.find(v => quoteListIds.includes(v.id)) ?? null,
    [quoteListIds, variants]
  );
  const isInQuoteList = variantInQuote != null;

  const aggregatedModo = useMemo(() => {
    if (variants.some(v => disponibilidadDeStock(v.stock) === 'en_stock')) return 'en_stock' as const;
    return 'por_encargo' as const;
  }, [variants]);

  // Título a altura fija (2 líneas) — si es muy largo, se achica la fuente
  // en vez de estirar la card por encima de sus vecinas en la grilla.
  const titleRef = useShrinkToFit<HTMLHeadingElement>([product.familia_nombre]);

  return (
    <article
      className={`group relative cursor-pointer bg-white flex flex-col overflow-hidden rounded-lg border shadow-sm transition-[transform,box-shadow,colors] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(26,22,19,0.12)] ${
        isInQuoteList ? 'border-emerald-300 shadow-emerald-100' : 'border-[#E8E2D9]'
      }`}
      onClick={() => onViewDetails(product, variants)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EAE2] flex-shrink-0">
        <div className="absolute inset-0 z-10 bg-[#1A1613]/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold bg-white/25 px-4 py-1.5 rounded-full border border-white/25">
            <Eye className="w-3 h-3" />
            Ver detalles
          </span>
        </div>

        <CloudinaryImage
          src={product.familia_cloudinary_url}
          alt={product.familia_nombre}
          width={400}
          height={533}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          placeholderClass="w-full h-full object-contain p-6"
        />

        <div className="absolute bottom-2.5 left-2.5 z-20">
          <AvailabilityBadge modo={aggregatedModo} size="sm" />
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
          {product.familia_categoria}
        </p>
        <h3 ref={titleRef} className="product-card-title">
          {product.familia_nombre}
        </h3>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EAE2] gap-2">
          {hasVariants ? (
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#7B7064] min-w-0">
              <Layers className="w-3.5 h-3.5 text-[#C41B2E] flex-shrink-0" />
              <span className="truncate">{variants.length} variantes</span>
            </span>
          ) : (
            <span className="text-[10.5px] font-mono text-[#9A8E82] truncate">{product.codigo}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasVariants) { onViewDetails(product, variants); return; }
              if (isInQuoteList) setConfirmRemoveOpen(true);
              else onAddToQuote?.(product);
            }}
            aria-label={hasVariants ? `Ver variantes de ${product.nombre}` : (isInQuoteList ? `Quitar ${product.nombre} de la lista` : `Agregar ${product.nombre}`)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all duration-150 cursor-pointer ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                : 'bg-[#C41B2E] text-white hover:bg-[#B51426] shadow-sm shadow-red-900/15'
            }`}
          >
            {hasVariants ? (
              'Ver opciones'
            ) : isInQuoteList ? (
              <><Check className="w-3 h-3" /> En lista</>
            ) : (
              'Agregar'
            )}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmRemoveOpen}
        title={`¿Quitar "${product.nombre}" de tu lista?`}
        description="Vas a sacarlo de tu lista de cotización, pero podés volver a agregarlo cuando quieras."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (variantInQuote) onRemoveFromQuote?.(variantInQuote.id);
          setConfirmRemoveOpen(false);
        }}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </article>
  );
}
