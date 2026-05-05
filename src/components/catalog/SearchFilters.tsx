import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Package, Clock } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { categories } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import type { SortOption, AvailabilityFilter } from '@/hooks/useProducts';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  availabilityFilter: AvailabilityFilter;
  onAvailabilityChange: (availability: AvailabilityFilter) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: 'default',    label: 'Relevancia',   icon: <ArrowUpDown className="w-3 h-3" /> },
  { id: 'price-asc',  label: 'Menor precio', icon: <ArrowUp    className="w-3 h-3" /> },
  { id: 'price-desc', label: 'Mayor precio', icon: <ArrowDown  className="w-3 h-3" /> },
];

const AVAILABILITY_OPTIONS: { id: AvailabilityFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all',         label: 'Todos',       icon: null },
  { id: 'en_stock',    label: 'En stock',    icon: <Package className="w-3 h-3" /> },
  { id: 'por_encargo', label: 'Por encargo', icon: <Clock   className="w-3 h-3" /> },
];

/** Tiny pill-style chip button */
function Chip({
  active,
  color = 'red',
  onClick,
  children,
}: {
  active: boolean;
  color?: 'red' | 'green' | 'amber';
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeStyles = {
    red:   'border-[#C41B2E]/35 text-[#C41B2E] bg-[rgba(196,27,46,0.06)]',
    green: 'border-emerald-300 text-emerald-700 bg-emerald-50',
    amber: 'border-amber-300   text-amber-700   bg-amber-50',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 flex-shrink-0
        px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.07em]
        border rounded-sm transition-all duration-150 cursor-pointer whitespace-nowrap
        ${active
          ? activeStyles[color]
          : 'border-[#EBE5DC] text-[#9E9080] bg-white hover:border-[#C0B5A8] hover:text-[#6B6159]'}
      `}
    >
      {children}
    </button>
  );
}

/** Compact label above a chip group */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#C0B5A8] mb-1 block">
      {children}
    </span>
  );
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  availabilityFilter,
  onAvailabilityChange,
  onClearFilters,
  resultCount,
  totalCount,
}: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => onSearchChange(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalSearch('');
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters =
    selectedCategory ||
    searchQuery ||
    sortOption !== 'default' ||
    availabilityFilter !== 'all';

  const allTabs = [{ id: null, name: 'Todos' }, ...categories.map(c => ({ id: c.id, name: c.name }))];

  return (
    <div className="w-full space-y-3">

      {/* ── Row 1: Search + counter + clear ───────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-5 pr-8 py-2 bg-transparent border-0 border-b border-[#D8D0C6] focus:border-[#C41B2E] text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none transition-colors duration-200"
          />
          <AnimatePresence>
            {localSearch && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.1 }}
                onClick={() => setLocalSearch('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-[#C0B5A8] hover:text-[#6B6159] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Counter + clear */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono text-[#C0B5A8] hidden sm:flex items-center gap-1">
            <span className="text-[#6B6159] font-semibold">{resultCount}</span>
            <span className="text-[#D8D0C6]">/</span>
            <span>{totalCount}</span>
          </span>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#9E9080] hover:text-[#C41B2E] border border-[#EBE5DC] hover:border-[#C41B2E]/30 rounded-sm transition-all cursor-pointer bg-white"
              >
                <X className="w-2.5 h-2.5" />
                Limpiar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Row 2: Ordenar | Disponibilidad — responsive pill bar ─── */}
      {/*
          Mobile  → horizontal scroll on a single line
          Desktop → two labeled groups side by side
      */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">

        {/* Sort group */}
        <div className="min-w-0">
          <GroupLabel>Ordenar</GroupLabel>
          <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {SORT_OPTIONS.map(({ id, label, icon }) => (
              <Chip
                key={id}
                active={sortOption === id}
                color="red"
                onClick={() => onSortChange(id)}
              >
                {icon}{label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Vertical divider (desktop only) */}
        <div className="hidden sm:block w-px self-stretch bg-[#EBE5DC] flex-shrink-0" />

        {/* Availability group */}
        <div className="min-w-0">
          <GroupLabel>Disponibilidad</GroupLabel>
          <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {AVAILABILITY_OPTIONS.map(({ id, label, icon }) => {
              const color =
                id === 'en-stock'    ? 'green' :
                id === 'por-encargo' ? 'amber' : 'red';
              return (
                <Chip
                  key={id}
                  active={availabilityFilter === id}
                  color={color as 'red' | 'green' | 'amber'}
                  onClick={() => onAvailabilityChange(id)}
                >
                  {icon}{label}
                </Chip>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Category tabs ───────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-[#EBE5DC] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {allTabs.map(({ id, name }) => {
          const isActive = selectedCategory === id;
          return (
            <button
              key={id ?? 'all'}
              onClick={() => { onCategoryChange(id); onSubcategoryChange(null); }}
              className={`
                relative flex-shrink-0 px-3.5 py-2.5
                text-[11px] font-semibold uppercase tracking-[0.08em]
                transition-colors duration-150 whitespace-nowrap cursor-pointer
                ${isActive ? 'text-[#C41B2E]' : 'text-[#9E9080] hover:text-[#6B6159]'}
              `}
            >
              {name}
              {isActive && (
                <motion.div
                  layoutId="catUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C41B2E]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>


    
    </div>
  );
}
