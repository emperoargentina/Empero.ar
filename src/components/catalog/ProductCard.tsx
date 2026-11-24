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

// Card clickeable con acción propia (patrón "stretched button"): el título es
// un <button> cuyo ::after cubre toda la card, así toda la superficie abre el
// detalle, se puede usar con teclado y el botón "Agregar" sigue siendo un
// control independiente por encima (ver .product-card en index.css).
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
      className={`product-card group relative bg-white flex flex-col overflow-hidden rounded-lg border shadow-sm ${
        isInQuoteList ? 'border-emerald-300 shadow-emerald-100' : 'border-[#E8E2D9]'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EAE2] flex-shrink-0">
        <div className="product-card__overlay absolute inset-0 z-10 bg-[#1A1613]/45 opacity-0 transition-opacity duration-200 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold bg-white/25 px-4 py-1.5 rounded-full border border-white/25">
            <Eye className="w-3 h-3" />
            Ver detalles
          </span>
        </div>

        <CloudinaryImage
          src={product.familia_cloudinary_url}
          alt=""
          width={400}
          height={533}
          sizes="(min-width: 1536px) 18vw, (min-width: 1280px) 24vw, (min-width: 1024px) 34vw, (min-width: 640px) 48vw, 92vw"
          className="product-card__img w-full h-full object-cover"
          placeholderClass="w-full h-full object-contain p-6"
        />

        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
          <AvailabilityBadge modo={aggregatedModo} size="sm" />
        </div>

        <AnimatePresence>
          {isInQuoteList && (
            <motion.div
              className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            >
              <Check className="w-3.5 h-3.5 text-white" role="img" aria-label="En tu lista" />
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
          <button
            type="button"
            className="product-card__link"
            onClick={() => onViewDetails(product, variants)}
          >
            {product.familia_nombre}
          </button>
        </h3>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EAE2] gap-2">
          {hasVariants ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B6159] min-w-0">
              <Layers className="w-3.5 h-3.5 text-[#C41B2E] flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{variants.length} variantes</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-[#7B7064] truncate">{product.codigo}</span>
          )}

          <button
            type="button"
            onClick={() => {
              if (hasVariants) { onViewDetails(product, variants); return; }
              if (isInQuoteList) setConfirmRemoveOpen(true);
              else onAddToQuote?.(product);
            }}
            aria-label={hasVariants
              ? `Ver opciones de ${product.familia_nombre}`
              : (isInQuoteList ? `En lista: quitar ${product.nombre}` : `Agregar ${product.nombre} a la lista`)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 min-h-8 rounded-lg text-[11px] font-semibold transition-colors duration-150 cursor-pointer ${
              isInQuoteList
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                : 'bg-[#C41B2E] text-white hover:bg-[#B51426] shadow-sm shadow-red-900/15'
            }`}
          >
            {hasVariants ? (
              'Ver opciones'
            ) : isInQuoteList ? (
              <><Check className="w-3 h-3" aria-hidden="true" /> En lista</>
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
