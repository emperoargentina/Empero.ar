import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Package, Filter, Search, X,
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, LayoutGrid, Warehouse, ConciergeBell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentType } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { AvailabilityFilter } from '@/hooks/useProducts';
import { scrollToElement } from '@/lib/scroll';
import { type Product, categories } from '@/data/products';
import { groupProducts } from '@/lib/groupProducts';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductModal } from '@/components/catalog/ProductModal';
import { Pagination } from '@/components/catalog/Pagination';
import { FeaturedCarousel } from '@/components/catalog/FeaturedCarousel';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, Warehouse, ConciergeBell,
};

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string; dot: string | null }[] = [
  { value: 'all', label: 'Todos', dot: null },
  { value: 'en_stock', label: 'En Stock', dot: 'bg-emerald-500' },
  { value: 'por_encargo', label: 'Por Encargo', dot: 'bg-amber-500' },
];

const CATEGORY_ORDER = [
  'Refrigeración', 'Lavado', 'Hornos',
  'Cocinas', 'Freidoras', 'Planchas', 'Parrillas',
  'Distribución', 'Servicio', 'Mueblería', 'Bases', 'Elaboración', 'Cucipastas',
];

const orderedCategories = CATEGORY_ORDER
  .map(id => categories.find(c => c.id === id))
  .filter((c): c is (typeof categories)[number] => c !== undefined);

function getItemsPerPage(): number {
  const w = window.innerWidth;
  if (w >= 1536) return 16;
  if (w >= 1280) return 12;
  if (w >= 1024) return 12;
  if (w >= 640)  return 8;
  return 6;
}

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

const VALID_CATEGORY_IDS = new Set(categories.map(c => c.id));
const VALID_AVAILABILITY = new Set<AvailabilityFilter>(['all', 'en_stock', 'por_encargo']);

// Filtros en la URL (?categoria=Hornos&q=freidora&stock=en_stock): se pueden
// compartir por WhatsApp y sobreviven a una recarga.
function readUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('categoria');
  const stock = params.get('stock') as AvailabilityFilter | null;
  return {
    categoria: categoria && VALID_CATEGORY_IDS.has(categoria) ? categoria : null,
    q: params.get('q')?.slice(0, 100) ?? '',
    stock: stock && VALID_AVAILABILITY.has(stock) ? stock : 'all' as AvailabilityFilter,
  };
}

function writeUrlFilters(categoria: string | null, q: string, stock: AvailabilityFilter) {
  const url = new URL(window.location.href);
  const set = (key: string, value: string | null) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  };
  set('categoria', categoria);
  set('q', q.trim() || null);
  set('stock', stock === 'all' ? null : stock);
  if (url.href !== window.location.href) {
    // replaceState conserva el state de react-router y no agrega entradas al historial.
    window.history.replaceState(window.history.state, '', url);
  }
}

export interface CategoryRequest {
  id: string;
}

interface ProductCatalogProps {
  /** Pedido de categoría desde la navbar/footer (objeto nuevo en cada click). */
  categoryRequest?: CategoryRequest | null;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  quoteListIds?: string[];
}

export function ProductCatalog({
  categoryRequest = null,
  onAddToQuote,
  onRemoveFromQuote,
  quoteListIds = [],
}: ProductCatalogProps) {
  const {
    allProducts,
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
  } = useProducts(readUrlFilters);

  const [requestedPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(() => readUrlFilters().q);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);
  const catalogRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuredProducts = useMemo(
    () => allProducts
      .filter(p => p.destacado === true && p.disponible)
      .sort((a, b) => (a.destacado_orden ?? Infinity) - (b.destacado_orden ?? Infinity)),
    [allProducts]
  )

  const groupedProducts = useMemo(() => groupProducts(filteredProducts), [filteredProducts]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(groupedProducts.length / itemsPerPage)),
    [groupedProducts.length, itemsPerPage]
  );

  // Página efectiva: nunca más allá de la última (p. ej. si un resize cambia itemsPerPage).
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groupedProducts.slice(start, start + itemsPerPage);
  }, [groupedProducts, currentPage, itemsPerPage]);

  // Al cambiar un filtro se vuelve a la página 1 (ajuste durante el render,
  // sin efecto ni render extra).
  const filterKey = `${searchQuery}\u0000${selectedCategory ?? ''}\u0000${availabilityFilter}`;
  const [pageFilterKey, setPageFilterKey] = useState(filterKey);
  if (filterKey !== pageFilterKey) {
    setPageFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Categoría elegida desde la navbar/footer: reemplaza búsqueda y filtros previos.
  const [handledRequest, setHandledRequest] = useState(categoryRequest);
  if (categoryRequest !== handledRequest) {
    setHandledRequest(categoryRequest);
    if (categoryRequest) {
      setLocalSearch('');
      setSearchQuery('');
      setAvailabilityFilter('all');
      setSelectedCategory(categoryRequest.id);
    }
  }

  useEffect(() => {
    writeUrlFilters(selectedCategory, searchQuery, availabilityFilter);
  }, [selectedCategory, searchQuery, availabilityFilter]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  const scrollToCatalog = useCallback(() => {
    const el = searchRef.current || catalogRef.current;
    if (el) scrollToElement(el, 16);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    scrollToCatalog();
  }, [scrollToCatalog]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  }, [currentPage, totalPages, handlePageChange]);

  const handleViewDetails = useCallback((product: Product, variants: Product[]) => {
    setSelectedProduct(product);
    setSelectedVariants(variants);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
      setSelectedVariants([]);
    }, 200);
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

  // Al escribir en el buscador se limpian los filtros de categoría/disponibilidad
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    if (value.trim()) {
      setSelectedCategory(null);
      setAvailabilityFilter('all');
    }
  }, [setSelectedCategory, setAvailabilityFilter]);

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
    <>
      {!loading && featuredProducts.length > 0 && (
        <FeaturedCarousel
          products={featuredProducts}
          onViewDetails={(product) => handleViewDetails(product, [product])}
          onAddToQuote={onAddToQuote}
          onRemoveFromQuote={onRemoveFromQuote}
          quoteListIds={quoteListIds}
        />
      )}
    <section ref={catalogRef} id="catalogo" aria-labelledby="catalogo-title" className="py-20 lg:py-24 bg-[var(--page-bg)] relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <AnimatedSection direction="up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Catálogo completo
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.08}>
            <h2 id="catalogo-title" className="text-4xl md:text-5xl font-serif font-[560] text-[#1A1613]">
              Nuestros <em className="not-italic text-[#C41B2E]">productos</em>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.14}>
            <p className="text-[#6B6159] mt-4 max-w-xl mx-auto text-base leading-relaxed text-pretty">
              {loading ? 'Cargando productos...' : `${totalProducts} productos. Agregá los que te interesan y cotizá por WhatsApp.`}
            </p>
          </AnimatedSection>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center mb-8">
            <p className="text-sm text-red-700 font-medium">
              {allProducts.length > 0
                ? 'No pudimos actualizar el catálogo; mostramos la última versión guardada.'
                : `No pudimos cargar los productos. ${error}`}
            </p>
            <button
              type="button"
              onClick={refetch}
              className="text-xs px-4 py-1.5 border border-[#C41B2E] text-[#C41B2E] rounded-lg hover:bg-[rgba(196,27,46,0.06)] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Search topbar ── */}
        <AnimatedSection direction="up" delay={0.1}>
          <search ref={searchRef} className="block mb-6">
            <form className="flex gap-3 items-center" onSubmit={e => { e.preventDefault(); setSearchQuery(localSearch); }}>
              <div className="relative flex-1 group/search">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none" aria-hidden="true">
                  <Search className="w-4 h-4 text-[#9A8E82] group-focus-within/search:text-[#C41B2E] transition-colors duration-200" />
                  <div className="w-px h-4 bg-[#E8E2D9] group-focus-within/search:bg-[#C41B2E]/20 transition-colors duration-200" />
                </div>
                <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
                <input
                  id="catalog-search"
                  type="search"
                  name="q"
                  placeholder="Buscar por nombre o código…"
                  value={localSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="search-input w-full pl-12 pr-11 py-3 bg-white border border-[#E8E2D9] rounded-2xl text-base sm:text-[14px] text-[#1A1613] placeholder:text-[#7B7064] focus:border-[#C41B2E]/40 transition-[border-color,box-shadow] duration-200 shadow-sm"
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
                        type="button"
                        onClick={() => { setLocalSearch(''); setSearchQuery(''); document.getElementById('catalog-search')?.focus(); }}
                        aria-label="Limpiar búsqueda"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F0EAE2] text-[#6B6159] hover:bg-[#EBE5DC] hover:text-[#1A1613] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileSheetOpen(true)}
                aria-haspopup="dialog"
                aria-label={activeFilterCount > 0 ? `Filtros, ${activeFilterCount} activos` : 'Filtros'}
                className={`flex md:hidden items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-semibold border transition-all duration-150 cursor-pointer flex-shrink-0 ${
                  hasActiveFilters
                    ? 'bg-[#C41B2E] text-white border-[#C41B2E] shadow-sm'
                    : 'bg-white text-[#1A1613] border-[#E8E2D9] hover:border-[#C41B2E]/30 shadow-sm'
                }`}
              >
                <Filter className="w-4 h-4" aria-hidden="true" />
                Filtros
                {activeFilterCount > 0 && (
                  <span aria-hidden="true" className="w-5 h-5 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white/40">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </form>
          </search>
        </AnimatedSection>

        {/* ── 2-column layout ── */}
        <div className="flex gap-6 items-stretch">

          <CatalogSidebar {...sidebarProps} />

          <div className="flex-1 min-w-0">

            {/* Región de estado: anuncia la cantidad de resultados al filtrar o buscar. */}
            <p role="status" className="text-[12px] text-[#6B6159] mb-4 font-medium min-h-[1lh]">
              {!loading && (
                <>
                  Mostrando <span className="text-[#1A1613] font-semibold">{filteredCount}</span> producto{filteredCount !== 1 ? 's' : ''}
                  {filteredCount !== totalProducts && (
                    <span className="font-normal"> de {totalProducts}</span>
                  )}
                  {totalPages > 1 && <span className="font-normal"> · página {currentPage} de {totalPages}</span>}
                </>
              )}
            </p>

            {loading && (
              <div aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && paginatedGroups.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    variants={{
                      enter: { transition: { staggerChildren: 0.04 } },
                      exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                    }}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-10"
                  >
                    {paginatedGroups.map(group => (
                      <motion.div
                        key={group.key}
                        variants={{
                          initial: { opacity: 0, y: 12 },
                          enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                          exit: { opacity: 0, y: -12, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
                        }}
                      >
                        <ProductCard
                          variants={group.variants}
                          onViewDetails={handleViewDetails}
                          onAddToQuote={onAddToQuote}
                          onRemoveFromQuote={onRemoveFromQuote}
                          quoteListIds={quoteListIds}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}

            {!loading && !error && paginatedGroups.length === 0 && (
              <AnimatePresence>
                <motion.div
                  className="text-center py-24"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-white border border-[#EBE5DC] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Package className="w-7 h-7 text-[#7B7064]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1613] mb-2">Sin resultados</h3>
                  <p className="text-[#7B7064] mb-7 max-w-xs mx-auto text-sm leading-relaxed">
                    Ningún producto coincide con tu búsqueda o filtros activos.
                  </p>
                  <button
                    type="button"
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
        <SheetContent side="bottom" className="h-[85dvh] max-h-[85dvh] rounded-t-2xl p-0 flex flex-col gap-0 md:hidden">
          <SheetHeader className="px-4 py-3 border-b border-[#EBE5DC] flex-shrink-0">
            <SheetTitle className="text-[13px] font-bold text-[#1A1613]">Filtros</SheetTitle>
            <SheetDescription className="sr-only">Filtrá el catálogo de productos</SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <fieldset className="px-4 pt-4 pb-2">
              <legend className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6159] mb-3">Categoría</legend>
              <div className="flex flex-col gap-0.5">
                <label className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                  selectedCategory === null ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
                }`}>
                  <input type="radio" name="mobile-category" checked={selectedCategory === null} onChange={() => handleCategoryChange(null)} className="w-4 h-4 accent-[#C41B2E]" />
                  <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />
                  <span className={`flex-1 text-[13px] font-medium ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>Todas</span>
                  <span className="text-[11px] text-[#7B7064]">({totalProducts})</span>
                </label>
                {orderedCategories.map(cat => {
                  const Icon = ICON_MAP[cat.icon];
                  const active = selectedCategory === cat.id;
                  return (
                    <label key={cat.id} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                      <input type="radio" name="mobile-category" checked={active} onChange={() => handleCategoryChange(cat.id)} className="w-4 h-4 accent-[#C41B2E]" />
                      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />}
                      <span className={`flex-1 text-[13px] font-medium ${active ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{cat.name}</span>
                      <span className="text-[11px] text-[#7B7064]">({categoryCounts[cat.id] ?? 0})</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="h-px bg-[#EBE5DC] mx-4 my-2" />

            <fieldset className="px-4 pb-4">
              <legend className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6159] mb-3">Disponibilidad</legend>
              <div className="flex flex-col gap-0.5">
                {AVAILABILITY_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${availabilityFilter === opt.value ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                    <input type="radio" name="mobile-availability" checked={availabilityFilter === opt.value} onChange={() => handleAvailabilityChange(opt.value)} className="w-4 h-4 accent-[#C41B2E]" />
                    <span className={`flex-1 text-[13px] font-medium ${availabilityFilter === opt.value ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{opt.label}</span>
                    {opt.dot && <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <SheetFooter className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#EBE5DC] flex-row gap-3 flex-shrink-0">
            <button type="button" onClick={handleClearFilters} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#C41B2E] bg-[rgba(196,27,46,0.06)] hover:bg-[rgba(196,27,46,0.1)] border border-[rgba(196,27,46,0.2)] transition-colors cursor-pointer">
              Limpiar
            </button>
            <button type="button" onClick={() => setMobileSheetOpen(false)} className="flex-[2] py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] transition-colors cursor-pointer shadow-sm">
              Ver {filteredCount} producto{filteredCount !== 1 ? 's' : ''}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ProductModal
        product={selectedProduct}
        variants={selectedVariants}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToQuote={onAddToQuote}
        onRemoveFromQuote={onRemoveFromQuote}
        quoteListIds={quoteListIds}
      />
    </section>
    </>
  );
}
