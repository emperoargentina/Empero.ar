import { useState, useMemo, useCallback, useEffect } from 'react';
import { fetchAvailableProducts } from '@/lib/productsApi';
import { disponibilidadDeStock } from '@/lib/availability';
import type { Product } from '@/data/products';

export type { Product };
export type SortOption = 'default' | 'name-asc' | 'name-desc';
export type AvailabilityFilter = 'all' | 'en_stock' | 'por_encargo';

const CACHE_KEY = 'empero_public_v1'
const CACHE_TTL = 30 * 60 * 1000

function readCache(): { data: Product[]; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeCache(data: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

// Admin writes (destacados, stock, etc.) call this so the home page doesn't keep
// serving its own separately-cached product list for up to CACHE_TTL after a change.
export function invalidatePublicProductsCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Storage unavailable — nothing to clean up
  }
}

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

export async function prefetchProducts(): Promise<void> {
  const cached = readCache();
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return;
  try {
    const data = await fetchAvailableProducts();
    if (data) writeCache(data);
  } catch {
    // silent — ProductCatalog will retry
  }
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
      if (fetchTrigger === 0) {
        const cached = readCache()
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setAllProducts(cached.data)
          setLoading(false)
          return
        }
      }

      setLoading(true);
      setError(null);
      try {
        const products = await fetchAvailableProducts();
        writeCache(products);
        setAllProducts(products);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar productos';
        const stale = readCache()
        if (stale) {
          setAllProducts(stale.data)
        }
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
        p.familia_nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.etiqueta?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => (p.familia_categoria ?? p.categoria) === selectedCategory);
    }

    if (availabilityFilter !== 'all') {
      result = result.filter(p => disponibilidadDeStock(p.stock) === availabilityFilter);
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
      const cat = p.familia_categoria ?? p.categoria;
      if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
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
