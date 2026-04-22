// =============================================================================
// SearchFilters Component - Búsqueda y filtros de productos
// =============================================================================

import { Search, X, ChevronDown } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { categories, subcategories } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalSearch('');
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = selectedCategory || selectedSubcategory || searchQuery;

  const availableSubcategories = selectedCategory 
    ? subcategories[selectedCategory] || []
    : [];

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="input-search w-full py-3.5 text-base"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                selectedCategory
                  ? 'border-[#d32f2f] bg-[#ffebee] text-[#d32f2f]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm">
                {selectedCategoryName || 'Todas las categorías'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-80 overflow-auto">
            <DropdownMenuItem
              onClick={() => {
                onCategoryChange(null);
                onSubcategoryChange(null);
              }}
              className={!selectedCategory ? 'bg-[#ffebee] text-[#d32f2f]' : ''}
            >
              Todas las categorías
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id);
                  onSubcategoryChange(null);
                }}
                className={selectedCategory === category.id ? 'bg-[#ffebee] text-[#d32f2f]' : ''}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Subcategory Filter - Only show if category selected */}
        {selectedCategory && availableSubcategories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  selectedSubcategory
                    ? 'border-[#d32f2f] bg-[#ffebee] text-[#d32f2f]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm">
                  {selectedSubcategory || 'Todos los tipos'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => onSubcategoryChange(null)}
                className={!selectedSubcategory ? 'bg-[#ffebee] text-[#d32f2f]' : ''}
              >
                Todos los tipos
              </DropdownMenuItem>
              {availableSubcategories.map((sub) => (
                <DropdownMenuItem
                  key={sub}
                  onClick={() => onSubcategoryChange(sub)}
                  className={selectedSubcategory === sub ? 'bg-[#ffebee] text-[#d32f2f]' : ''}
                >
                  {sub}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="flex items-center gap-2 text-gray-500 hover:text-[#d32f2f] hover:bg-[#ffebee]"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Limpiar filtros</span>
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-gray-500">
          Mostrando <span className="font-medium text-gray-900">{resultCount}</span> de{' '}
          <span className="font-medium text-gray-900">{totalCount}</span> productos
        </div>
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffebee] text-[#d32f2f] text-sm rounded-full">
              {selectedCategoryName}
              <button
                onClick={() => {
                  onCategoryChange(null);
                  onSubcategoryChange(null);
                }}
                className="p-0.5 hover:bg-[#d32f2f]/10 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedSubcategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffebee] text-[#d32f2f] text-sm rounded-full">
              {selectedSubcategory}
              <button
                onClick={() => onSubcategoryChange(null)}
                className="p-0.5 hover:bg-[#d32f2f]/10 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffebee] text-[#d32f2f] text-sm rounded-full">
              Búsqueda: "{searchQuery}"
              <button
                onClick={() => setLocalSearch('')}
                className="p-0.5 hover:bg-[#d32f2f]/10 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
