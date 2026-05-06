import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Package, Filter, Search, X,
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentType } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { AvailabilityFilter } from '@/hooks/useProducts';
import { type Product, categories } from '@/data/products';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductModal } from '@/components/catalog/ProductModal';
import { Pagination } from '@/components/catalog/Pagination';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers,
};

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string; dot: string | null }[] = [
  { value: 'all', label: 'Todos', dot: null },
  { value: 'en_stock', label: 'En Stock', dot: 'bg-emerald-500' },
  { value: 'por_encargo', label: 'Por Encargo', dot: 'bg-amber-500' },
];

const CATEGORY_ORDER = [
  'Refrigeración', 'Lavado', 'Hornos', 'Hornos a Gas',
  'Cocinas', 'Freidoras', 'Planchas', 'Parrillas',
  'Distribución', 'Mesas', 'Superficies', 'Elaboración', 'Cucipastas',
];

const orderedCategories = CATEGORY_ORDER
  .map(id => categories.find(c => c.id === id))
  .filter((c): c is (typeof categories)[number] => c !== undefined);

const ITEMS_PER_PAGE = (() => {
  const w = window.innerWidth;
  if (w >= 1280) return 20;
  if (w >= 1024) return 16;
  if (w >= 768) return 8;
  return 4;
})();

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[3/4] bg-[#F0EAE2]" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-20 bg-[#EBE5DC] rounded-full" />
        <div className="h-4 bg-[#EBE5DC] rounded w-full" />
        <div className="h-3.5 bg-[#EBE5DC] rounded w-3/4" />
        <div className="h-3 w-16 bg-[#F0EAE2] rounded mt-1" />
        <div className="h-px bg-[#F0EAE2] !mt-2" />
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-14 bg-[#EBE5DC] rounded" />
          <div className="h-5 w-16 bg-[#EBE5DC] rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ProductCatalogProps {
  initialCategory?: string | null;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  quoteListIds?: string[];
}

export function ProductCatalog({
  initialCategory = null,
  onAddToQuote,
  onRemoveFromQuote,
  quoteListIds = [],
}: ProductCatalogProps) {
  const {
    filteredProducts,
    searchQuery,
    selectedCategory,
    availabilityFilter,
    loading,
    error,
    setSearchQuery,
    setSelectedCategory,
    setAvailabilityFilter,
    clearFilters,
    totalProducts,
    filteredCount,
    categoryCounts,
    refetch,
  } = useProducts();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const catalogRef = useRef<HTMLElement>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)),
    [filteredProducts.length]
  );

  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, availabilityFilter]);

  useEffect(() => {
    if (initialCategory && !selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  const scrollToCatalog = useCallback(() => {
    const el = catalogRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
    scrollToCatalog();
  }, [scrollToCatalog]);

  const handleNext = useCallback(() => {
    setCurrentPage(p => {
      const next = p + 1;
      return next <= totalPages ? next : p;
    });
    scrollToCatalog();
  }, [totalPages, scrollToCatalog]);

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  }, []);

  const handleCategoryChange = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
  }, [setSelectedCategory]);

  const handleAvailabilityChange = useCallback((a: AvailabilityFilter) => {
    setAvailabilityFilter(a);
  }, [setAvailabilityFilter]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setLocalSearch('');
  }, [clearFilters]);

  const hasActiveFilters = selectedCategory !== null || availabilityFilter !== 'all';
  const activeFilterCount = (selectedCategory !== null ? 1 : 0) + (availabilityFilter !== 'all' ? 1 : 0);

  const sidebarProps = {
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    availabilityFilter,
    onAvailabilityChange: handleAvailabilityChange,
    onClearFilters: handleClearFilters,
    categoryCounts,
    totalProducts,
  };

  return (
    <section ref={catalogRef} id="catalogo" className="py-20 lg:py-24 bg-[#FAFAF8] relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <AnimatedSection direction="up">
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
              {loading ? 'Cargando productos...' : `${totalProducts} productos. Agregá los que te interesan y cotizá por WhatsApp.`}
            </p>
          </AnimatedSection>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-6 text-center mb-8">
            <p className="text-sm text-red-600 font-medium">Error al cargar productos: {error}</p>
            <button
              onClick={refetch}
              className="text-xs px-4 py-1.5 border border-[#C41B2E] text-[#C41B2E] rounded-lg hover:bg-[rgba(196,27,46,0.06)] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Search topbar ── */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="mb-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 group/search">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Search className="w-4 h-4 text-[#B8AFA6] group-focus-within/search:text-[#C41B2E] transition-colors duration-200" />
                  <div className="w-px h-4 bg-[#E8E2D9] group-focus-within/search:bg-[#C41B2E]/20 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  aria-label="Buscar productos"
                  className="w-full pl-12 pr-10 py-3 bg-white border border-[#E8E2D9] rounded-2xl text-[13.5px] text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E]/40 focus:shadow-[0_0_0_3px_rgba(196,27,46,0.08)] transition-all duration-200 shadow-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {localSearch && (
                      <motion.button
                        key="clear"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => setLocalSearch('')}
                        aria-label="Limpiar búsqueda"
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#F0EAE2] text-[#9A8E82] hover:bg-[#EBE5DC] hover:text-[#1A1613] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={() => setMobileSheetOpen(true)}
                aria-label="Abrir filtros"
                className={`flex md:hidden items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-semibold border transition-all duration-150 cursor-pointer flex-shrink-0 ${
                  hasActiveFilters
                    ? 'bg-[#C41B2E] text-white border-[#C41B2E] shadow-sm'
                    : 'bg-white text-[#1A1613] border-[#E8E2D9] hover:border-[#C41B2E]/30 shadow-sm'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white/40">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* ── 2-column layout ── */}
        <div className="flex gap-6 items-stretch">

          <CatalogSidebar {...sidebarProps} />

          <div className="flex-1 min-w-0">

            {!loading && !error && (
              <p className="text-[12px] text-[#9A8E82] mb-4 font-medium">
                Mostrando <span className="text-[#1A1613] font-semibold">{filteredCount}</span> producto{filteredCount !== 1 ? 's' : ''}
                {filteredCount !== totalProducts && (
                  <span className="text-[#C0B5A8] font-normal"> de {totalProducts}</span>
                )}
              </p>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && paginatedProducts.length > 0 && (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {paginatedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                      onAddToQuote={onAddToQuote}
                      onRemoveFromQuote={onRemoveFromQuote}
                      isInQuoteList={quoteListIds.includes(product.id)}
                    />
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                )}
              </>
            )}

            {!loading && !error && paginatedProducts.length === 0 && (
              <AnimatePresence>
                <motion.div
                  className="text-center py-24"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-white border border-[#EBE5DC] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Package className="w-7 h-7 text-[#C0B5A8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1613] mb-2">Sin resultados</h3>
                  <p className="text-[#9E9080] mb-7 max-w-xs mx-auto text-sm leading-relaxed">
                    Ningún producto coincide con tu búsqueda o filtros activos.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#C41B2E] text-sm font-medium rounded-xl border border-[rgba(196,27,46,0.3)] hover:bg-[rgba(196,27,46,0.04)] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ── */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 py-3 border-b border-[#EBE5DC] flex-shrink-0">
            <SheetTitle className="text-[13px] font-bold text-[#1A1613]">Filtros</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A8E82] mb-3">Categoría</p>
              <div className="flex flex-col gap-0.5">
                <label className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                  selectedCategory === null ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
                }`}>
                  <input type="radio" name="mobile-category" checked={selectedCategory === null} onChange={() => handleCategoryChange(null)} className="w-4 h-4 accent-[#C41B2E]" />
                  <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />
                  <span className={`flex-1 text-[13px] font-medium ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>Todas</span>
                  <span className="text-[11px] text-[#C0B5A8]">({totalProducts})</span>
                </label>
                {orderedCategories.map(cat => {
                  const Icon = ICON_MAP[cat.icon];
                  const active = selectedCategory === cat.id;
                  return (
                    <label key={cat.id} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                      <input type="radio" name="mobile-category" checked={active} onChange={() => handleCategoryChange(cat.id)} className="w-4 h-4 accent-[#C41B2E]" />
                      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />}
                      <span className={`flex-1 text-[13px] font-medium ${active ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{cat.name}</span>
                      <span className="text-[11px] text-[#C0B5A8]">({categoryCounts[cat.id] ?? 0})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#EBE5DC] mx-4 my-2" />

            <div className="px-4 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A8E82] mb-3">Disponibilidad</p>
              <div className="flex flex-col gap-0.5">
                {AVAILABILITY_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${availabilityFilter === opt.value ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                    <input type="radio" name="mobile-availability" checked={availabilityFilter === opt.value} onChange={() => handleAvailabilityChange(opt.value)} className="w-4 h-4 accent-[#C41B2E]" />
                    <span className={`flex-1 text-[13px] font-medium ${availabilityFilter === opt.value ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{opt.label}</span>
                    {opt.dot && <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 py-4 border-t border-[#EBE5DC] flex-row gap-3 flex-shrink-0">
            <button onClick={handleClearFilters} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#C41B2E] bg-[rgba(196,27,46,0.06)] hover:bg-[rgba(196,27,46,0.1)] border border-[rgba(196,27,46,0.2)] transition-colors cursor-pointer">
              Limpiar
            </button>
            <button onClick={() => setMobileSheetOpen(false)} className="flex-[2] py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] transition-colors cursor-pointer shadow-sm">
              Ver {filteredCount} producto{filteredCount !== 1 ? 's' : ''}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToQuote={onAddToQuote}
        onRemoveFromQuote={onRemoveFromQuote}
        isInQuoteList={selectedProduct ? quoteListIds.includes(selectedProduct.id) : false}
      />
    </section>
  );
}
