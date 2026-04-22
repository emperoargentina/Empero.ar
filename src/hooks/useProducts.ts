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
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
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

    return result;
  }, [searchQuery, selectedCategory, selectedSubcategory]);

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
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
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
