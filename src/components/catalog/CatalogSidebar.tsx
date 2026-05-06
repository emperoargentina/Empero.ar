import { useState } from 'react';
import { X, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories } from '@/data/products';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AvailabilityFilter } from '@/hooks/useProducts';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers,
};

const CATEGORY_ORDER = [
  'Refrigeración', 'Lavado', 'Hornos', 'Hornos a Gas',
  'Cocinas', 'Freidoras', 'Planchas', 'Parrillas',
  'Distribución', 'Mesas', 'Superficies', 'Elaboración', 'Cucipastas',
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
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A8E82] mb-2.5 px-1">
          Categoría
        </p>
        <div className="flex flex-col gap-0.5">
          <label className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 ${
            selectedCategory === null ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
          }`}>
            <input
              type="radio"
              name="catalog-category"
              checked={selectedCategory === null}
              onChange={() => onCategoryChange(null)}
              className="w-3.5 h-3.5 accent-[#C41B2E] flex-shrink-0"
            />
            <LayoutGrid className={`w-3.5 h-3.5 flex-shrink-0 ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />
            <span className={`flex-1 text-[12.5px] font-medium ${selectedCategory === null ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>
              Todas
            </span>
            <span className="text-[11px] text-[#C0B5A8] flex-shrink-0">({totalProducts})</span>
          </label>

          {orderedCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon];
            const active = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <label
                key={cat.id}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 ${
                  active ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
                }`}
              >
                <input
                  type="radio"
                  name="catalog-category"
                  checked={active}
                  onChange={() => onCategoryChange(cat.id)}
                  className="w-3.5 h-3.5 accent-[#C41B2E] flex-shrink-0"
                />
                {Icon && (
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />
                )}
                <span className={`flex-1 text-[12.5px] font-medium truncate ${active ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#C0B5A8] flex-shrink-0">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#EBE5DC]" />

      {/* Disponibilidad */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A8E82] mb-2.5 px-1">
          Disponibilidad
        </p>
        <div className="flex flex-col gap-0.5">
          {AVAILABILITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 ${
                availabilityFilter === opt.value ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
              }`}
            >
              <input
                type="radio"
                name="catalog-availability"
                checked={availabilityFilter === opt.value}
                onChange={() => onAvailabilityChange(opt.value)}
                className="w-3.5 h-3.5 accent-[#C41B2E] flex-shrink-0"
              />
              <span className={`flex-1 text-[12.5px] font-medium ${
                availabilityFilter === opt.value ? 'text-[#C41B2E]' : 'text-[#3A3530]'
              }`}>
                {opt.label}
              </span>
              {opt.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />}
            </label>
          ))}
        </div>
      </div>

      {/* Limpiar filtros */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-[#C41B2E] bg-[rgba(196,27,46,0.06)] hover:bg-[rgba(196,27,46,0.1)] border border-[rgba(196,27,46,0.2)] transition-colors cursor-pointer w-full"
          >
            <X className="w-3.5 h-3.5" />
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
        className="hidden lg:block w-60 flex-shrink-0 sticky self-start"
        style={{ top: 'var(--sidebar-top)', maxHeight: 'var(--sidebar-max-height)' }}
      >
        <div className="bg-white border border-[#EBE5DC] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0EAE2] flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C41B2E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1613]">Filtros</span>
          </div>
          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E8E2D9] [&::-webkit-scrollbar-thumb]:rounded-full">
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* ── Tablet: narrow icon bar ── */}
      <aside
        className="hidden md:block lg:hidden w-14 flex-shrink-0 sticky"
        style={{ top: '80px', maxHeight: 'calc(100vh - 96px)', alignSelf: 'flex-start' }}
      >
        <div className="bg-white border border-[#EBE5DC] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
          {/* Header icon — opens full panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTabletOpen(true)}
                aria-label="Abrir filtros"
                className="w-full flex items-center justify-center py-3 border-b border-[#F0EAE2] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C41B2E]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Abrir filtros</TooltipContent>
          </Tooltip>

          {/* Scrollable icons */}
          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
            {/* Todas */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => props.onCategoryChange(null)}
                  aria-label="Todas las categorías"
                  className={`w-full flex items-center justify-center py-2.5 transition-colors duration-150 cursor-pointer ${
                    props.selectedCategory === null
                      ? 'text-[#C41B2E] bg-[#FFF0F1]'
                      : 'text-[#9A8E82] hover:bg-[#F5F0EA] hover:text-[#C41B2E]'
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
                      onClick={() => props.onCategoryChange(active ? null : cat.id)}
                      aria-label={cat.name}
                      className={`w-full flex items-center justify-center py-2.5 transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'text-[#C41B2E] bg-[#FFF0F1]'
                          : 'text-[#9A8E82] hover:bg-[#F5F0EA] hover:text-[#C41B2E]'
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
        <SheetContent side="left" className="w-72 p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 py-3 border-b border-[#EBE5DC]">
            <SheetTitle className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1613]">
              Filtros
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <FilterContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
