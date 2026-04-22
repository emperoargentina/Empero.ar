// =============================================================================
// ProductCard Component - Estilo senior premium
// =============================================================================

import { Eye, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { type Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
  isInQuoteList = false
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generar imagen placeholder basada en categoría
  const getPlaceholderImage = (category: string) => {
    const categoryImages: Record<string, string> = {
      'Lavado': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      'Refrigeración': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop',
      'Distribución y Autoservicio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
      'Hornos': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
      'Freidoras': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
      'Planchas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
      'Cocinas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
      'Parrillas': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
      'Cucipastas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      'Hornos a Gas Bajo Mostrador': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
      'Superficies': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      'Elaboración': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&h=400&fit=crop',
      'Mesas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    };
    return categoryImages[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop';
  };

  const imageUrl = getPlaceholderImage(product.category);

  return (
    <motion.div
      className="card-product group cursor-pointer bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(product)}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-2xl">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#d32f2f] rounded-full animate-spin" />
          </div>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Button
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-50 rounded-full px-4 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Ver
            </Button>
          </motion.div>
        </motion.div>

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5">
          <Badge className="badge-category text-[11px] font-semibold backdrop-blur-sm bg-white/90">
            {product.category}
          </Badge>
        </div>

        {/* Added indicator */}
        {isInQuoteList && (
          <motion.div 
            className="absolute top-2.5 right-2.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-1.5">
        <p className="text-[11px] text-gray-400 font-medium tracking-wide">{product.sku}</p>
        
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[36px]">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-400">{product.subcategory}</p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {product.features.slice(0, 2).map((feature, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            className={`w-full py-2 h-auto text-xs font-medium rounded-xl transition-all duration-300 ${
              isInQuoteList
                ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                : 'bg-[#d32f2f] hover:bg-[#c62828] text-white shadow-md shadow-red-500/15 hover:shadow-red-500/25'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToQuote?.(product);
            }}
            disabled={isInQuoteList}
          >
            {isInQuoteList ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Agregado
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Agregar a lista
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
