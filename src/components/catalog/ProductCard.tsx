import { useMemo } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { type Product } from '@/data/products';
import { AvailabilityBadge } from './AvailabilityBadge';
import { disponibilidadDeStock } from '@/lib/availability';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import type { QuoteQuantities } from '@/hooks/useQuoteList';
import { ListedTag } from './ListedTag';

interface ProductCardProps {
  variants: Product[];
  onViewDetails: (product: Product, variants: Product[]) => void;
  quoteQuantities?: QuoteQuantities;
}

// Card de destino único: toda la superficie abre la ficha del producto, donde
// se eligen variantes y se agrega a la cotización. El título es un <button>
// cuyo ::after cubre la card (patrón "stretched button", ver .product-card en
// index.css). Foto y datos son dos regiones alineadas por fila con subgrid.
export function ProductCard({ variants, onViewDetails, quoteQuantities = {} }: ProductCardProps) {
  const product = variants[0];
  const hasVariants = variants.length > 1;

  // Unidades en la lista sumando todas las variantes de la familia
  const listedQty = variants.reduce((sum, v) => sum + (quoteQuantities[v.id] ?? 0), 0);
  const isInQuoteList = listedQty > 0;

  const aggregatedModo = useMemo(() => {
    if (variants.some(v => disponibilidadDeStock(v.stock) === 'en_stock')) return 'en_stock' as const;
    return 'por_encargo' as const;
  }, [variants]);

  return (
    <article className={`product-card ${isInQuoteList ? 'product-card--in-list' : ''}`}>
      {/* Foto */}
      <div className="product-card__media">
        <CloudinaryImage
          src={product.familia_cloudinary_url}
          alt=""
          width={400}
          height={533}
          sizes="(min-width: 1536px) 15vw, (min-width: 1280px) 19vw, (min-width: 768px) 26vw, 46vw"
          className="product-card__img w-full h-full object-cover"
          placeholderClass="w-full h-full object-contain p-8 opacity-70"
        />

        {/* Arriba: dato del producto. Abajo: tu estado (en la lista) */}
        <div className="product-card__badges">
          <AvailabilityBadge modo={aggregatedModo} size="sm" />
        </div>
        {isInQuoteList && (
          <div className="card-listed">
            <ListedTag quantity={listedQty} />
          </div>
        )}
      </div>

      {/* Datos */}
      <div className="product-card__body">
        <p className="product-card-category">{product.familia_categoria}</p>
        <h3 className="product-card__title">
          <button
            type="button"
            className="product-card__link"
            onClick={() => onViewDetails(product, variants)}
            aria-label={`${product.familia_nombre}${hasVariants ? `, ${variants.length} variantes` : ''}${isInQuoteList ? ', en tu lista' : ''}. Ver detalles`}
          >
            {product.familia_nombre}
          </button>
        </h3>

        <div className="product-card__footer" aria-hidden="true">
          {hasVariants ? (
            <span className="product-card__meta">
              <Layers className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              {variants.length} variantes
            </span>
          ) : (
            <span className="product-card__meta font-mono">{product.codigo}</span>
          )}
          <span className="product-card__cta">
            Ver
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
