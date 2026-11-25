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
import type { QuoteQuantities } from '@/hooks/useQuoteList';
import { Pagination } from '@/components/catalog/Pagination';
import { FeaturedCarousel } from '@/components/catalog/FeaturedCarousel';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeader } from '@/components/SectionHeader';
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
  if (w >= 1536) return 15; // 5 × 3
  if (w >= 1280) return 16; // 4 × 4
  if (w >= 768)  return 12; // 3 × 4
  return 10;                // 2 × 5
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[0.875rem] border border-ink-200 overflow-hidden">
      <div className="aspect-[4/5] skeleton" />
      <div className="px-3.5 pt-3.5 pb-3.5 space-y-2 border-t border-ink-150">
        <div className="h-2.5 w-16 skeleton rounded" />
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-2/3 skeleton rounded" />
        <div className="h-2.5 w-20 skeleton rounded" />
        <div className="h-9 w-full skeleton rounded-[0.5625rem] !mt-3" />
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

const NO_QUANTITIES: QuoteQuantities = {};

interface ProductCatalogProps {
  /** Pedido de categoría desde la navbar/footer (objeto nuevo en cada click). */
  categoryRequest?: CategoryRequest | null;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  onUpdateQuoteQuantity?: (productId: string, quantity: number) => void;
  quoteQuantities?: QuoteQuantities;
}

export function ProductCatalog({
  categoryRequest = null,
  onAddToQuote,
  onRemoveFromQuote,
  onUpdateQuoteQuantity,
  quoteQuantities = NO_QUANTITIES,
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
          quoteQuantities={quoteQuantities}
        />
      )}
    <section ref={catalogRef} id="catalogo" aria-labelledby="catalogo-title" className="py-16 lg:py-24 bg-[var(--page-bg)] relative">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="container-custom">

        {/* ── Header ── */}
        <SectionHeader
          eyebrow="Catálogo completo"
          titleId="catalogo-title"
          title="Nuestros"
          accent="productos"
          description={
            <p>
              {loading
                ? 'Cargando productos…'
                : <><strong className="font-semibold text-ink-900 tabular-nums">{totalProducts}</strong> productos. Agregá los que te interesan y cotizá por WhatsApp.</>}
            </p>
          }
          className="mb-8 lg:mb-10"
        />

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
              className="btn btn-sm btn-secondary"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Search topbar ── */}
        <AnimatedSection direction="up" delay={0.1}>
          <search ref={searchRef} className="block mb-5 lg:mb-6">
            <form className="flex gap-3 items-center" onSubmit={e => { e.preventDefault(); setSearchQuery(localSearch); }}>
              <div className="relative flex-1 group/search">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none" aria-hidden="true">
                  <Search className="w-[1.125rem] h-[1.125rem] text-ink-400 group-focus-within/search:text-brand transition-colors duration-200" />
                  <span className="w-px h-4 bg-ink-200 group-focus-within/search:bg-brand/25 transition-colors duration-200" />
                </div>
                <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
                <input
                  id="catalog-search"
                  type="search"
                  name="q"
                  placeholder="Buscar productos…"
                  value={localSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="search-input w-full h-12 pl-14 pr-12 bg-white border border-ink-300 rounded-2xl text-base sm:text-[0.9062rem] text-ink-900 placeholder:text-ink-500 shadow-[var(--shadow-sm)] hover:border-ink-400 focus:border-brand/50 focus:shadow-[0_0_0_4px_rgb(var(--brand-600)/0.08)] transition-[border-color,box-shadow] duration-200"
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
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-ink-150 text-ink-600 hover:bg-ink-200 hover:text-ink-900 transition-colors cursor-pointer"
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
                className={`flex md:hidden items-center gap-2 h-12 px-4 max-[359px]:px-3.5 rounded-2xl text-[0.875rem] font-semibold border transition-colors duration-150 cursor-pointer flex-shrink-0 ${
                  hasActiveFilters
                    ? 'bg-brand text-white border-brand shadow-[var(--shadow-sm)]'
                    : 'bg-white text-ink-900 border-ink-300 hover:border-brand/40 shadow-[var(--shadow-sm)]'
                }`}
              >
                <Filter className="w-4 h-4" aria-hidden="true" />
                {/* En pantallas muy angostas, solo el ícono (el nombre está en aria-label) */}
                <span className="max-[359px]:hidden">Filtros</span>
                {activeFilterCount > 0 && (
                  <span aria-hidden="true" className="w-5 h-5 rounded-full bg-white/25 text-white text-[0.625rem] font-bold flex items-center justify-center ring-1 ring-white/40">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </form>
          </search>
        </AnimatedSection>

        {/* ── 2-column layout ── */}
        <div className="flex gap-6 xl:gap-8 items-stretch">

          <CatalogSidebar {...sidebarProps} />

          <div className="flex-1 min-w-0">

            {/* Región de estado: anuncia la cantidad de resultados al filtrar o buscar. */}
            <p role="status" className="text-[0.75rem] text-ink-600 mb-4 font-medium min-h-[1lh]">
              {!loading && (
                <>
                  Mostrando <span className="text-ink-900 font-semibold">{filteredCount}</span> producto{filteredCount !== 1 ? 's' : ''}
                  {filteredCount !== totalProducts && (
                    <span className="font-normal"> de {totalProducts}</span>
                  )}
                  {totalPages > 1 && <span className="font-normal"> · página {currentPage} de {totalPages}</span>}
                </>
              )}
            </p>

            {loading && (
              <div aria-hidden="true" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
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
                    className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 mb-10"
                  >
                    {paginatedGroups.map(group => (
                      <motion.div
                        key={group.key}
                        className="product-card-cell"
                        variants={{
                          initial: { opacity: 0, y: 12 },
                          enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                          exit: { opacity: 0, y: -12, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
                        }}
                      >
                        <ProductCard
                          variants={group.variants}
                          onViewDetails={handleViewDetails}
                          quoteQuantities={quoteQuantities}
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
                  <div className="w-16 h-16 bg-white border border-ink-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Package className="w-7 h-7 text-ink-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">Sin resultados</h3>
                  <p className="text-ink-500 mb-7 max-w-xs mx-auto text-sm leading-relaxed">
                    Ningún producto coincide con tu búsqueda o filtros activos.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn btn-secondary"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
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
          <SheetHeader className="px-4 py-3 border-b border-ink-200 flex-shrink-0">
            <SheetTitle className="text-[0.8125rem] font-bold text-ink-900">Filtros</SheetTitle>
            <SheetDescription className="sr-only">Filtrá el catálogo de productos</SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <fieldset className="px-4 pt-4 pb-2">
              <legend className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-2">Categoría</legend>
              <div className="flex flex-col gap-0.5">
                <label className={`filter-row ${
                  selectedCategory === null ? 'filter-row--active' : ''
                }`}>
                  <input type="radio" name="mobile-category" checked={selectedCategory === null} onChange={() => handleCategoryChange(null)} className="filter-row__radio" />
                  <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${selectedCategory === null ? 'text-brand' : 'text-ink-500'}`} />
                  <span className={`flex-1 text-[0.875rem] ${selectedCategory === null ? 'text-brand font-semibold' : 'text-ink-700'}`}>Todas</span>
                  <span className="font-mono text-[0.7188rem] text-ink-500 tabular-nums">({totalProducts})</span>
                </label>
                {orderedCategories.map(cat => {
                  const Icon = ICON_MAP[cat.icon];
                  const active = selectedCategory === cat.id;
                  return (
                    <label key={cat.id} className={`filter-row ${active ? 'filter-row--active' : ''}`}>
                      <input type="radio" name="mobile-category" checked={active} onChange={() => handleCategoryChange(cat.id)} className="filter-row__radio" />
                      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-brand' : 'text-ink-500'}`} />}
                      <span className={`flex-1 text-[0.875rem] ${active ? 'text-brand font-semibold' : 'text-ink-700'}`}>{cat.name}</span>
                      <span className="font-mono text-[0.7188rem] text-ink-500 tabular-nums">({categoryCounts[cat.id] ?? 0})</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="h-px bg-ink-200 mx-4 my-2" />

            <fieldset className="px-4 pb-4">
              <legend className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-2">Disponibilidad</legend>
              <div className="flex flex-col gap-0.5">
                {AVAILABILITY_OPTIONS.map(opt => (
                  <label key={opt.value} className={`filter-row ${availabilityFilter === opt.value ? 'filter-row--active' : ''}`}>
                    <input type="radio" name="mobile-availability" checked={availabilityFilter === opt.value} onChange={() => handleAvailabilityChange(opt.value)} className="filter-row__radio" />
                    <span className={`flex-1 text-[0.875rem] ${availabilityFilter === opt.value ? 'text-brand font-semibold' : 'text-ink-700'}`}>{opt.label}</span>
                    {opt.dot && <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <SheetFooter className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-ink-200 flex-row gap-3 flex-shrink-0">
            <button type="button" onClick={handleClearFilters} className="btn btn-secondary flex-1">
              Limpiar
            </button>
            <button type="button" onClick={() => setMobileSheetOpen(false)} className="btn btn-primary flex-[2]">
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
        onUpdateQuoteQuantity={onUpdateQuoteQuantity}
        quoteQuantities={quoteQuantities}
      />
    </section>
    </>
  );
}
