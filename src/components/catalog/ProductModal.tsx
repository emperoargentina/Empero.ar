// =============================================================================
// ProductModal Component - Modal de detalle de producto
// =============================================================================

import { Calculator, Check, Package, Tag, Layers, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  isInQuoteList = false 
}: ProductModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Generar imagen placeholder basada en categoría
  const getPlaceholderImage = (category: string) => {
    const categoryImages: Record<string, string> = {
      'Lavado': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'Refrigeración': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop',
      'Distribución y Autoservicio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
      'Hornos': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
      'Freidoras': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
      'Planchas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
      'Cocinas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
      'Parrillas': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      'Cucipastas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'Hornos a Gas Bajo Mostrador': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
      'Superficies': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'Elaboración': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=600&fit=crop',
      'Mesas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    };
    return categoryImages[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';
  };

  const imageUrl = getPlaceholderImage(product.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-gray-100 min-h-[300px]">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-[#d32f2f] rounded-full animate-spin" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="badge-category text-sm px-4 py-1.5">
                {product.category}
              </Badge>
            </div>

            {/* Added indicator */}
            {isInQuoteList && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                En tu lista
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-5">
            <DialogHeader className="space-y-3">
              {/* SKU */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Tag className="w-4 h-4" />
                <span>SKU: {product.sku}</span>
              </div>
              
              {/* Title */}
              <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </DialogTitle>
              
              {/* Subcategory */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d32f2f]" />
                <span className="text-sm font-medium text-[#d32f2f]">
                  {product.subcategory}
                </span>
              </div>
            </DialogHeader>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Descripción</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <Package className="w-4 h-4" />
                Características
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-[#d32f2f] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Button
                className="w-full btn-primary py-3"
                onClick={() => onAddToQuote?.(product)}
                disabled={isInQuoteList}
              >
                {isInQuoteList ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Producto agregado
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar a mi lista
                  </>
                )}
              </Button>

              <Button
                className="w-full btn-whatsapp py-3 text-base"
                onClick={onClose}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Seguir viendo productos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
