// =============================================================================
// useProducts Hook - Fetch de productos desde Supabase con filtros y paginación
// =============================================================================

import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/products';

export type { Product };
export type SortOption = 'default' | 'price-asc' | 'price-desc';
export type AvailabilityFilter = 'all' | 'en_stock' | 'por_encargo';

interface UseProductsReturn {
  // Data
  allProducts: Product[];
  filteredProducts: Product[];

  // Status
  loading: boolean;
  error: string | null;

  // Search & Filter state
  searchQuery: string;
  selectedCategory: string | null;
  sortOption: SortOption;
  availabilityFilter: AvailabilityFilter;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortOption: (sort: SortOption) => void;
  setAvailabilityFilter: (availability: AvailabilityFilter) => void;
  clearFilters: () => void;
  refetch: () => void;

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .eq('disponible', true)
          .order('nombre', { ascending: true });

        if (sbError) throw sbError;
        setAllProducts(data ?? []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar productos';
        setError(msg);
        console.error('useProducts: error fetching from Supabase', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [fetchTrigger]);

  const refetch = useCallback(() => setFetchTrigger(n => n + 1), []);

  // Filter & sort products in the client
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(p =>
        p.categoria?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Availability
    if (availabilityFilter !== 'all') {
      result = result.filter(p => p.modo_disponibilidad === availabilityFilter);
    }

    // Sort
    if (sortOption === 'price-asc') {
      result = [...result].sort((a, b) => (a.precio_usd ?? 0) - (b.precio_usd ?? 0));
    } else if (sortOption === 'price-desc') {
      result = [...result].sort((a, b) => (b.precio_usd ?? 0) - (a.precio_usd ?? 0));
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, availabilityFilter, sortOption]);

  // Pagination
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage)),
    [filteredProducts.length, itemsPerPage]
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, availabilityFilter, sortOption]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortOption('default');
    setAvailabilityFilter('all');
    setCurrentPage(1);
  }, []);

  return {
    allProducts,
    filteredProducts,
    loading,
    error,
    searchQuery,
    selectedCategory,
    sortOption,
    availabilityFilter,
    setSearchQuery,
    setSelectedCategory,
    setSortOption,
    setAvailabilityFilter,
    clearFilters,
    refetch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedProducts,
    totalProducts: allProducts.length,
    filteredCount: filteredProducts.length,
  };
}
