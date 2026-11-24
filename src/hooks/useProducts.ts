import { useState, useMemo, useCallback, useEffect } from 'react';
import { fetchAvailableProducts } from '@/lib/productsApi';
import { disponibilidadDeStock } from '@/lib/availability';
import { normalizeText, searchTokens, matchesAllTokens } from '@/lib/text';
import type { Product } from '@/data/products';

export type { Product };
export type SortOption = 'default' | 'name-asc' | 'name-desc';
export type AvailabilityFilter = 'all' | 'en_stock' | 'por_encargo';

const CACHE_KEY = 'empero_public_v1'
const CACHE_TTL = 30 * 60 * 1000

interface CacheEntry { data: Product[]; timestamp: number }

// Copia en memoria: evita re-parsear el JSON de localStorage cada vez que
// un componente monta useProducts().
let memoryCache: CacheEntry | null = null
// Una sola request en vuelo: el preloader, App y el catálogo comparten la
// misma promesa en vez de pedir el catálogo completo tres veces.
let inflight: Promise<Product[]> | null = null

function readCache(): CacheEntry | null {
  if (memoryCache) return memoryCache
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    memoryCache = JSON.parse(raw) as CacheEntry
    return memoryCache
  } catch {
    return null
  }
}

function writeCache(data: Product[]) {
  memoryCache = { data, timestamp: Date.now() }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache))
  } catch {
    // Storage lleno o bloqueado — la copia en memoria alcanza para esta visita
  }
}

function isFresh(entry: CacheEntry | null): entry is CacheEntry {
  return entry != null && Date.now() - entry.timestamp < CACHE_TTL
}

function loadProducts(force = false): Promise<Product[]> {
  if (!force) {
    const cached = readCache()
    if (isFresh(cached)) return Promise.resolve(cached.data)
    if (inflight) return inflight
  }
  inflight = fetchAvailableProducts()
    .then(data => {
      writeCache(data)
      return data
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

// Admin writes (destacados, stock, etc.) call this so the home page doesn't keep
// serving its own separately-cached product list for up to CACHE_TTL after a change.
export function invalidatePublicProductsCache() {
  memoryCache = null
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Storage unavailable — nothing to clean up
  }
}

export async function prefetchProducts(): Promise<void> {
  try {
    await loadProducts();
  } catch {
    // silent — ProductCatalog will retry
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

export interface InitialFilters {
  categoria: string | null;
  q: string;
  stock: AvailabilityFilter;
}

/** @param getInitialFilters filtros de arranque (p. ej. leídos de la URL), se evalúa una sola vez. */
export function useProducts(getInitialFilters?: () => InitialFilters): UseProductsReturn {
  const [initialFilters] = useState(() => getInitialFilters?.() ?? null);
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const cached = readCache()
    return isFresh(cached) ? cached.data : []
  });
  const [loading, setLoading] = useState(() => !isFresh(readCache()));
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [searchQuery, setSearchQuery] = useState(initialFilters?.q ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialFilters?.categoria ?? null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>(initialFilters?.stock ?? 'all');

  useEffect(() => {
    const force = fetchTrigger > 0
    if (!force && isFresh(readCache())) return

    let cancelled = false

    loadProducts(force)
      .then(products => {
        if (!cancelled) setAllProducts(products)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const stale = readCache()
        if (stale) setAllProducts(stale.data)
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
        console.error('useProducts: error fetching from Supabase', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [fetchTrigger]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchTrigger(n => n + 1);
  }, []);

  // Texto normalizado (sin tildes) por producto — se calcula una vez por
  // catálogo, no en cada tecla del buscador.
  const searchIndex = useMemo(
    () => new Map(allProducts.map(p => [
      p.id,
      normalizeText([p.nombre, p.familia_nombre, p.categoria, p.familia_categoria, p.codigo, p.etiqueta].join(' ')),
    ])),
    [allProducts]
  );

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    const tokens = searchTokens(searchQuery);
    if (tokens.length) {
      result = result.filter(p => matchesAllTokens(searchIndex.get(p.id) ?? '', tokens));
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
  }, [allProducts, searchIndex, searchQuery, selectedCategory, availabilityFilter, sortOption]);

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
