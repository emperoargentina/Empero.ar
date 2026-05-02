// =============================================================================
// useProducts Hook - Gestión de productos, búsqueda y filtros
// =============================================================================

import { useState, useMemo, useCallback } from 'react';
import { 
  products, 
  categories, 
  subcategories, 
  searchProducts,
  type Product 
} from '@/data/products';

export type SortOption = 'default' | 'price-asc' | 'price-desc';
export type AvailabilityFilter = 'all' | 'en-stock' | 'por-encargo';

interface UseProductsReturn {
  // Data
  allProducts: Product[];
  filteredProducts: Product[];
  categories: typeof categories;
  subcategories: typeof subcategories;
  
  // Search & Filter state
  searchQuery: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  sortOption: SortOption;
  availabilityFilter: AvailabilityFilter;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
  setSortOption: (sort: SortOption) => void;
  setAvailabilityFilter: (availability: AvailabilityFilter) => void;
  clearFilters: () => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalPages: number;
  paginatedProducts: Product[];
  
  // Stats
  totalProducts: number;
  filteredCount: number;
}

export function useProducts(itemsPerPage: number = 24): UseProductsReturn {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search
    if (searchQuery.trim()) {
      result = searchProducts(searchQuery);
    }

    // Apply category filter
    if (selectedCategory) {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name;
      if (categoryName) {
        result = result.filter(p => p.category === categoryName);
      }
    }

    // Apply subcategory filter
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(p => p.availability === availabilityFilter);
    }

    // Apply sorting
    if (sortOption === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedSubcategory, sortOption, availabilityFilter]);

  // Pagination
  const totalPages = useMemo(() => 
    Math.ceil(filteredProducts.length / itemsPerPage),
    [filteredProducts.length, itemsPerPage]
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSortOption('default');
    setAvailabilityFilter('all');
    setCurrentPage(1);
  }, []);

  return {
    // Data
    allProducts: products,
    filteredProducts,
    categories,
    subcategories,
    
    // Search & Filter state
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    sortOption,
    availabilityFilter,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    setSortOption,
    setAvailabilityFilter,
    clearFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedProducts,
    
    // Stats
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
  };
}
