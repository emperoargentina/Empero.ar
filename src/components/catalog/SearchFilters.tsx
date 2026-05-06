import {
  Search, X, PackageCheck, Clock,
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, LayoutGrid,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { categories } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import type { AvailabilityFilter } from '@/hooks/useProducts';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  availabilityFilter: AvailabilityFilter;
  onAvailabilityChange: (availability: AvailabilityFilter) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers,
};

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
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

  const hasActiveFilters = selectedCategory !== null || localSearch !== '' || availabilityFilter !== 'all';

  const toggleAvailability = (val: 'en_stock' | 'por_encargo') => {
    onAvailabilityChange(availabilityFilter === val ? 'all' : val);
  };

  return (
    <div className="w-full bg-white border border-[#EBE5DC] rounded-2xl shadow-sm overflow-hidden">

      {/* ── Row 1: search + availability + meta ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F0EAE2]">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#C0B5A8] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-7 pr-7 py-1.5 bg-[#FAFAF8] border border-[#EBE5DC] rounded-lg text-[12px] text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E]/40 focus:bg-white transition-all duration-200"
          />
          <AnimatePresence>
            {localSearch && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.1 }}
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-[#C0B5A8] hover:text-[#6B6159] transition-colors"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#EBE5DC] flex-shrink-0" />

        {/* Availability toggles */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => toggleAvailability('en_stock')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap ${
              availabilityFilter === 'en_stock'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-white border-[#EBE5DC] text-[#6B6159] hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <PackageCheck className="w-3 h-3" />
            En Stock
          </button>

          <button
            onClick={() => toggleAvailability('por_encargo')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap ${
              availabilityFilter === 'por_encargo'
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white border-[#EBE5DC] text-[#6B6159] hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            <Clock className="w-3 h-3" />
            Por Encargo
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#EBE5DC] flex-shrink-0 hidden sm:block" />

        {/* Count */}
        <span className="hidden sm:flex items-center gap-1 text-[10.5px] font-mono text-[#C0B5A8] flex-shrink-0">
          <span className="text-[#4A4540] font-semibold">{resultCount}</span>
          <span>/</span>
          <span>{totalCount}</span>
        </span>

        {/* Clear */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={handleClear}
              className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#C41B2E] bg-[rgba(196,27,46,0.06)] hover:bg-[rgba(196,27,46,0.1)] border border-[rgba(196,27,46,0.2)] rounded-lg transition-all cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
              Limpiar
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Row 2: category chips horizontal scroll ── */}
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Todos */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold border flex-shrink-0 transition-all duration-150 cursor-pointer ${
            selectedCategory === null
              ? 'bg-[#1A1613] border-[#1A1613] text-white'
              : 'bg-white border-[#EBE5DC] text-[#6B6159] hover:border-[#C0B5A8] hover:text-[#1A1613]'
          }`}
        >
          <LayoutGrid className="w-3 h-3 flex-shrink-0" />
          Todos
        </button>

        {/* Per-category chips */}
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(active ? null : cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold border flex-shrink-0 transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-[#C41B2E] border-[#C41B2E] text-white shadow-sm'
                  : 'bg-white border-[#EBE5DC] text-[#6B6159] hover:border-[#C41B2E]/40 hover:text-[#C41B2E]'
              }`}
            >
              {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
              {cat.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
