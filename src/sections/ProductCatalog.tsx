// =============================================================================
// ProductCatalog Section - Con animaciones Framer Motion
// =============================================================================

import { useState, useCallback } from 'react';
import { Package, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { type Product } from '@/data/products';
import { SearchFilters } from '@/components/catalog/SearchFilters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductModal } from '@/components/catalog/ProductModal';
import { Pagination } from '@/components/catalog/Pagination';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

interface ProductCatalogProps {
  initialCategory?: string | null;
  onAddToQuote?: (product: Product) => void;
  quoteListIds?: string[];
}

export function ProductCatalog({ 
  initialCategory = null,
  onAddToQuote,
  quoteListIds = []
}: ProductCatalogProps) {
  const {
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProducts,
    totalProducts,
    filteredCount,
  } = useProducts(15);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set initial category if provided
  if (initialCategory && !selectedCategory) {
    setSelectedCategory(initialCategory);
  }

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setCurrentPage(1);
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [setSelectedCategory, setSelectedSubcategory, setCurrentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [setCurrentPage]);

  return (
    <section id="catalogo" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection direction="up">
            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Catálogo Completo
            </span>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Nuestros <span className="text-[#d32f2f]">productos</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg leading-relaxed">
              Explora nuestro catálogo de {totalProducts}+ productos. 
              Agrega los que te interesen a tu lista de cotización.
            </p>
          </AnimatedSection>
        </div>

        {/* Search & Filters */}
        <AnimatedSection direction="up" delay={0.15}>
          <div className="mb-8">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategorySelect}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={(sub) => {
                setSelectedSubcategory(sub);
                setCurrentPage(1);
              }}
              onClearFilters={clearFilters}
              resultCount={filteredCount}
              totalCount={totalProducts}
            />
          </div>
        </AnimatedSection>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToQuote={onAddToQuote}
                  isInQuoteList={quoteListIds.includes(product.id)}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <AnimatedSection direction="up">
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </AnimatedSection>
            )}
          </>
        ) : (
          <AnimatedSection direction="up">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                No encontramos productos que coincidan con tu búsqueda.
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#d32f2f] hover:text-[#d32f2f] transition-all"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </AnimatedSection>
        )}

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToQuote={onAddToQuote}
          isInQuoteList={selectedProduct ? quoteListIds.includes(selectedProduct.id) : false}
        />
      </div>
    </section>
  );
}
