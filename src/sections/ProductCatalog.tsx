import { useState, useCallback } from 'react';
import { Package, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { type Product } from '@/data/products';
import { SearchFilters } from '@/components/catalog/SearchFilters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductModal } from '@/components/catalog/ProductModal';
import { Pagination } from '@/components/catalog/Pagination';
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
  quoteListIds = [],
}: ProductCatalogProps) {
  const {
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    sortOption,
    availabilityFilter,
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    setSortOption,
    setAvailabilityFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProducts,
    totalProducts,
    filteredCount,
  } = useProducts(window.innerWidth < 640 ? 12 : 20);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, [setSelectedCategory, setSelectedSubcategory, setCurrentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [setCurrentPage]);

  return (
    <section id="catalogo" className="py-20 lg:py-24 bg-[#FAFAF8] overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection direction="up">
            {/* Ornament divider */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C41B2E]">
                Catálogo completo
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.08}>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1A1613]">
              Nuestros <em className="not-italic text-[#C41B2E]">productos</em>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.14}>
            <p className="text-[#9E9080] mt-4 max-w-xl mx-auto text-base leading-relaxed">
              Explorá {totalProducts}+ productos. Agregá los que te interesan y cotizá por WhatsApp.
            </p>
          </AnimatedSection>
        </div>

        {/* Filters */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="mb-8">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategorySelect}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={(sub) => { setSelectedSubcategory(sub); setCurrentPage(1); }}
              sortOption={sortOption}
              onSortChange={(s) => { setSortOption(s); setCurrentPage(1); }}
              availabilityFilter={availabilityFilter}
              onAvailabilityChange={(a) => { setAvailabilityFilter(a); setCurrentPage(1); }}
              onClearFilters={clearFilters}
              resultCount={filteredCount}
              totalCount={totalProducts}
            />
          </div>
        </AnimatedSection>

        {/* Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
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

            {totalPages > 1 && (
              <AnimatedSection direction="up">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </AnimatedSection>
            )}
          </>
        ) : (
          <AnimatedSection direction="up">
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-white border border-[#EBE5DC] rounded-xl flex items-center justify-center mx-auto mb-5">
                <Package className="w-7 h-7 text-[#C0B5A8]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1613] mb-2">Sin resultados</h3>
              <p className="text-[#9E9080] mb-7 max-w-xs mx-auto text-sm leading-relaxed">
                Ningún producto coincide con tu búsqueda o filtros.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#C41B2E] text-sm font-medium rounded-lg border border-[rgba(196,27,46,0.3)] hover:bg-[rgba(196,27,46,0.04)] transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToQuote={onAddToQuote}
        isInQuoteList={selectedProduct ? quoteListIds.includes(selectedProduct.id) : false}
      />
    </section>
  );
}
