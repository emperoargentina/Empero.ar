import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/products';

export type { Product };
export type SortOption = 'default' | 'name-asc' | 'name-desc';
export type AvailabilityFilter = 'all' | 'en_stock' | 'por_encargo';

interface UseProductsReturn {
  allProducts: Product[];
  filteredProducts: Product[];
  categoryCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortOption: SortOption;
  availabilityFilter: AvailabilityFilter;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortOption: (sort: SortOption) => void;
  setAvailabilityFilter: (availability: AvailabilityFilter) => void;
  clearFilters: () => void;
  refetch: () => void;
  totalProducts: number;
  filteredCount: number;
}

export function useProducts(): UseProductsReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

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

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    if (availabilityFilter !== 'all') {
      result = result.filter(p => p.modo_disponibilidad === availabilityFilter);
    }

    if (sortOption === 'name-asc') {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    } else if (sortOption === 'name-desc') {
      result = [...result].sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, availabilityFilter, sortOption]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      if (p.categoria) counts[p.categoria] = (counts[p.categoria] ?? 0) + 1;
    }
    return counts;
  }, [allProducts]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortOption('default');
    setAvailabilityFilter('all');
  }, []);

  return {
    allProducts,
    filteredProducts,
    categoryCounts,
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
    totalProducts: allProducts.length,
    filteredCount: filteredProducts.length,
  };
}
