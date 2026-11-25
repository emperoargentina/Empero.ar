import { useState } from 'react';
import { X, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, Warehouse, ConciergeBell,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories } from '@/data/products';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AvailabilityFilter } from '@/hooks/useProducts';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, Warehouse, ConciergeBell,
};

const CATEGORY_ORDER = [
  'Refrigeración', 'Lavado', 'Hornos',
  'Cocinas', 'Freidoras', 'Planchas', 'Parrillas',
  'Distribución', 'Servicio', 'Mueblería', 'Bases', 'Elaboración', 'Cucipastas',
];

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string; dot: string | null }[] = [
  { value: 'all', label: 'Todos', dot: null },
  { value: 'en_stock', label: 'En Stock', dot: 'bg-emerald-500' },
  { value: 'por_encargo', label: 'Por Encargo', dot: 'bg-amber-500' },
];

const orderedCategories = CATEGORY_ORDER
  .map(id => categories.find(c => c.id === id))
  .filter((c): c is (typeof categories)[number] => c !== undefined);

export interface CatalogSidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  availabilityFilter: AvailabilityFilter;
  onAvailabilityChange: (a: AvailabilityFilter) => void;
  onClearFilters: () => void;
  categoryCounts: Record<string, number>;
  totalProducts: number;
}

function FilterContent({
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  onClearFilters,
  categoryCounts,
  totalProducts,
}: CatalogSidebarProps) {
  const hasActiveFilters = selectedCategory !== null || availabilityFilter !== 'all';

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto">
      {/* Categoría */}
      <fieldset>
        <legend className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-2 px-2">
          Categoría
        </legend>
        <div className="flex flex-col gap-0.5">
          <label className={`filter-row ${
            selectedCategory === null ? 'filter-row--active' : ''
          }`}>
            <input
              type="radio"
              name="catalog-category"
              checked={selectedCategory === null}
              onChange={() => onCategoryChange(null)}
              className="filter-row__radio"
            />
            <LayoutGrid className={`w-3.5 h-3.5 flex-shrink-0 ${selectedCategory === null ? 'text-brand' : 'text-ink-500'}`} />
            <span className={`flex-1 text-[0.8438rem] ${selectedCategory === null ? 'text-brand font-semibold' : 'text-ink-700'}`}>
              Todas
            </span>
            <span className="font-mono text-[0.7188rem] text-ink-500 flex-shrink-0 tabular-nums">({totalProducts})</span>
          </label>

          {orderedCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon];
            const active = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <label
                key={cat.id}
                className={`filter-row ${
                  active ? 'filter-row--active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="catalog-category"
                  checked={active}
                  onChange={() => onCategoryChange(cat.id)}
                  className="filter-row__radio"
                />
                {Icon && (
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-brand' : 'text-ink-500'}`} />
                )}
                <span className={`flex-1 text-[0.8438rem] truncate ${active ? 'text-brand font-semibold' : 'text-ink-700'}`}>
                  {cat.name}
                </span>
                <span className="font-mono text-[0.7188rem] text-ink-500 flex-shrink-0 tabular-nums">({count})</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="h-px bg-ink-200" />

      {/* Disponibilidad */}
      <fieldset>
        <legend className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-2 px-2">
          Disponibilidad
        </legend>
        <div className="flex flex-col gap-0.5">
          {AVAILABILITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`filter-row ${
                availabilityFilter === opt.value ? 'filter-row--active' : ''
              }`}
            >
              <input
                type="radio"
                name="catalog-availability"
                checked={availabilityFilter === opt.value}
                onChange={() => onAvailabilityChange(opt.value)}
                className="filter-row__radio"
              />
              <span className={`flex-1 text-[0.8438rem] ${
                availabilityFilter === opt.value ? 'text-brand font-semibold' : 'text-ink-700'
              }`}>
                {opt.label}
              </span>
              {opt.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Limpiar filtros */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onClick={onClearFilters}
            className="btn btn-sm btn-secondary w-full"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Limpiar filtros
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CatalogSidebar(props: CatalogSidebarProps) {
  const [tabletOpen, setTabletOpen] = useState(false);

  return (
    <>
      {/* ── Desktop: static 240px sidebar ── */}
      <aside
        className="hidden lg:block w-56 flex-shrink-0 sticky self-start"
        style={{ top: 'var(--sidebar-top)', maxHeight: 'var(--sidebar-max-height)' }}
      >
        <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden flex flex-col h-full shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 px-4 h-12 border-b border-ink-150 flex-shrink-0 bg-ink-50/60">
            <SlidersHorizontal className="w-4 h-4 text-brand" aria-hidden="true" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-900">Filtros</span>
          </div>
          <div className="thin-scroll overflow-y-auto overscroll-contain flex-1" data-lenis-prevent>
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* ── Tablet: narrow icon bar ── */}
      <aside
        className="hidden md:block lg:hidden w-14 flex-shrink-0 sticky"
        style={{ top: '5rem', maxHeight: 'calc(100dvh - 6rem)', alignSelf: 'flex-start' }}
      >
        <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden flex flex-col h-full shadow-[var(--shadow-sm)]">
          {/* Header icon — opens full panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTabletOpen(true)}
                aria-label="Abrir filtros"
                className="w-full flex items-center justify-center py-3 border-b border-ink-150 hover:bg-ink-100 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Abrir filtros</TooltipContent>
          </Tooltip>

          {/* Scrollable icons */}
          <div className="overflow-y-auto flex-1 no-scrollbar" data-lenis-prevent>
            {/* Todas */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => props.onCategoryChange(null)}
                  aria-pressed={props.selectedCategory === null}
                  aria-label="Todas las categorías"
                  className={`w-full flex items-center justify-center py-2.5 transition-colors duration-150 cursor-pointer ${
                    props.selectedCategory === null
                      ? 'text-brand bg-brand-50'
                      : 'text-ink-500 hover:bg-ink-100 hover:text-brand'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Todas ({props.totalProducts})</TooltipContent>
            </Tooltip>

            {/* Category icons */}
            {orderedCategories.map(cat => {
              const Icon = ICON_MAP[cat.icon];
              const active = props.selectedCategory === cat.id;
              return (
                <Tooltip key={cat.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => props.onCategoryChange(active ? null : cat.id)}
                      aria-pressed={active}
                      aria-label={cat.name}
                      className={`w-full flex items-center justify-center py-2.5 transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'text-brand bg-brand-50'
                          : 'text-ink-500 hover:bg-ink-100 hover:text-brand'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {cat.name} ({props.categoryCounts[cat.id] ?? 0})
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Tablet: Sheet panel (slides from left) ── */}
      <Sheet open={tabletOpen} onOpenChange={setTabletOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col gap-0 lg:hidden">
          <SheetHeader className="px-4 py-3 border-b border-ink-200">
            <SheetTitle className="text-[0.9375rem] font-semibold text-ink-900">
              Filtros
            </SheetTitle>
            <SheetDescription className="sr-only">Filtrá el catálogo de productos</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <FilterContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
