import { Search, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { categories, subcategories } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedSubcategory: string | null;
  onSubcategoryChange: (subcategory: string | null) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
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

  const hasActiveFilters = selectedCategory || selectedSubcategory || searchQuery;
  const availableSubcategories = selectedCategory ? subcategories[selectedCategory] || [] : [];

  const allTabs = [{ id: null, name: 'Todos' }, ...categories.map(c => ({ id: c.id, name: c.name }))];

  return (
    <div className="w-full">

      {/* Search row */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-5 pr-8 py-2 bg-transparent border-0 border-b border-gray-200 focus:border-[#d32f2f] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors duration-200"
          />
          <AnimatePresence>
            {localSearch && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.1 }}
                onClick={() => setLocalSearch('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono text-gray-400 hidden sm:block">
            <span className="text-gray-700 font-bold">{resultCount}</span>
            <span className="text-gray-300 mx-1">/</span>
            {totalCount}
          </span>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                onClick={handleClear}
                className="text-[11px] font-bold text-gray-400 hover:text-[#d32f2f] transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {allTabs.map(({ id, name }) => {
          const isActive = selectedCategory === id;
          return (
            <button
              key={id ?? 'all'}
              onClick={() => { onCategoryChange(id); onSubcategoryChange(null); }}
              className={`relative flex-shrink-0 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-[0.08em] transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                isActive ? 'text-[#d32f2f]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {name}
              {isActive && (
                <motion.div
                  layoutId="catUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[#d32f2f]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory row */}
      <AnimatePresence>
        {selectedCategory && availableSubcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {availableSubcategories.map((sub) => {
                const active = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => onSubcategoryChange(active ? null : sub)}
                    className={`flex-shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all duration-150 cursor-pointer rounded-sm ${
                      active
                        ? 'border-[#d32f2f] text-[#d32f2f] bg-[#fff5f5]'
                        : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
