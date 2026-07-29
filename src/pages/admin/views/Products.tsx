import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getProductos, invalidateProductosCache, getCacheAge } from '@/lib/productosCache'
import { type Producto, CATEGORIAS, LOW_STOCK_THRESHOLD } from '@/types/producto'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, Package, AlertTriangle,
  Filter, Clock, Grid3X3, List,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CHUNK = 30

const BADGE_CLS = 'inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-28'

function StockBadge({ p }: { p: Producto }) {
  if (p.modo_disponibilidad === 'por_encargo') {
    return (
      <span className={`${BADGE_CLS} bg-amber-50 text-amber-700 border border-amber-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Por encargo
      </span>
    )
  }
  if (p.stock === 0) {
    return (
      <span className={`${BADGE_CLS} bg-red-50 text-red-600 border border-red-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Sin stock
      </span>
    )
  }
  if (p.stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className={`${BADGE_CLS} bg-red-50 text-red-600 border border-red-200`}>
        <AlertTriangle className="w-3 h-3 text-red-500" />
        {p.stock} ud.
      </span>
    )
  }
  return (
    <span className={`${BADGE_CLS} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {p.stock} ud.
    </span>
  )
}

export function Products() {
  const [allProductos, setAllProductos] = useState<Producto[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [fromCache, setFromCache]       = useState(false)
  const [cacheAge, setCacheAge]         = useState<number | null>(null)
  const [search, setSearch]             = useState('')
  const [categoria, setCategoria]       = useState('')
  const [modo, setModo]                 = useState<'all' | 'en_stock' | 'por_encargo'>('all')
  const [displayCount, setDisplayCount] = useState(CHUNK)
  const [viewMode, setViewMode]         = useState<'table' | 'grid'>('table')
  const sentinelRef                     = useRef<HTMLDivElement>(null)
  const navigate                        = useNavigate()

  const load = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    const result = await getProductos(force)
    if (result.error) {
      setError(result.error)
      toast.error('Error al cargar productos: ' + result.error)
    }
    setAllProductos(result.data)
    setFromCache(result.fromCache)
    setCacheAge(getCacheAge())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let list = allProductos
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q)
      )
    }
    if (categoria) list = list.filter(p => p.categoria === categoria)
    if (modo !== 'all') list = list.filter(p => p.modo_disponibilidad === modo)
    return list
  }, [allProductos, search, categoria, modo])

  useEffect(() => { setDisplayCount(CHUNK) }, [search, categoria, modo])

  const visibleItems   = filtered.slice(0, displayCount)
  const hasMore        = displayCount < filtered.length
  const totalCount     = filtered.length

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    if (!hasMore) return
    if (loading) return

    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          setTimeout(() => {
            setDisplayCount(p => p + CHUNK)
            setLoadingMore(false)
          }, 200)
        }
      },
      { rootMargin: '300px' },
    )

    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loading])

  const reloadAfterMutation = async () => {
    invalidateProductosCache()
    await load(true)
  }

  const handleDelete = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) { toast.error('Error al eliminar: ' + error.message); return }
    toast.success('Producto eliminado')
    await reloadAfterMutation()
  }

  const handleToggleDisponible = async (p: Producto) => {
    const { error } = await supabase
      .from('products')
      .update({ disponible: !p.disponible })
      .eq('id', p.id)
    if (error) { toast.error('Error al actualizar: ' + error.message); return }
    toast.success(`Producto ${!p.disponible ? 'activado' : 'desactivado'}`)
    await reloadAfterMutation()
  }

  const stockOk = allProductos.filter(p => p.modo_disponibilidad === 'en_stock' && p.stock > LOW_STOCK_THRESHOLD).length
  const stockBajo = allProductos.filter(p => p.modo_disponibilidad === 'en_stock' && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length
  const sinStock = allProductos.filter(p => p.modo_disponibilidad === 'en_stock' && p.stock === 0).length
  const porEncargo = allProductos.filter(p => p.modo_disponibilidad === 'por_encargo').length

  return (
    <>
      <style>{`
        @keyframes loadPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.8; }
        }
        @keyframes loadRing {
          0% { transform: rotate(0deg); opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0; }
        }
        @keyframes loadDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight">Productos</h1>
          <p className="text-sm text-[#9E9080] mt-0.5">
            {totalCount} producto{totalCount !== 1 ? 's' : ''}
            {(search || categoria || modo !== 'all') && (
              <span className="text-[#C0B5A8]"> filtrados</span>
            )}
            {fromCache && cacheAge !== null && (
              <span className="inline-flex items-center gap-1 ml-2 text-[#C0B5A8]">
                <Clock className="w-3 h-3" /> caché · {cacheAge} min
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/productos/nuevo')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] transition-all duration-200 shadow-lg shadow-[#C41B2E]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar producto
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: 'En stock', count: stockOk, color: 'bg-emerald-500' },
          { label: 'Stock bajo', count: stockBajo, color: 'bg-amber-500' },
          { label: 'Sin stock', count: sinStock, color: 'bg-red-500' },
          { label: 'Por encargo', count: porEncargo, color: 'bg-amber-400' },
        ].filter(s => s.count > 0).map(s => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6159] bg-white border border-[#EBE5DC] rounded-lg px-2.5 py-1">
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            {s.count} {s.label.toLowerCase()}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6159] bg-white border border-[#EBE5DC] rounded-lg px-2.5 py-1">
          <Package className="w-3 h-3 text-[#C0B5A8]" />
          {allProductos.length} total
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-red-500 to-rose-400" />
          <div className="p-4">
            <p className="text-sm font-semibold text-red-700">Error al cargar productos</p>
            <p className="text-xs text-red-500 mt-0.5 font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#EBE5DC] p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-9 pr-4 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8] pointer-events-none" />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="pl-8 pr-8 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 cursor-pointer appearance-none bg-white transition-all"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <select
          value={modo}
          onChange={e => setModo(e.target.value as typeof modo)}
          className="px-3 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 cursor-pointer appearance-none bg-white transition-all"
        >
          <option value="all">Stock: Todos</option>
          <option value="en_stock">Stock: En stock</option>
          <option value="por_encargo">Stock: Por encargo</option>
        </select>

        <div className="hidden sm:flex items-center border border-[#EBE5DC] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#F4F0E8] text-[#1A1613]' : 'text-[#C0B5A8] hover:text-[#6B6159]'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#F4F0E8] text-[#1A1613]' : 'text-[#C0B5A8] hover:text-[#6B6159]'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#EBE5DC] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C41B2E] to-[#B51426] flex items-center justify-center shadow-lg shadow-[#C41B2E]/20 animate-[loadPulse_1.4s_ease-in-out_infinite]">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-2xl border-2 border-[#C41B2E]/20 animate-[loadRing_1.8s_linear_infinite]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite_0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite_0.4s]" />
              </div>
              <p className="text-sm text-[#9E9080] font-medium">Cargando productos...</p>
            </div>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] flex items-center justify-center">
              <Package className="w-6 h-6 text-[#C0B5A8]" />
            </div>
            <p className="text-sm font-medium text-[#9E9080]">No se encontraron productos</p>
            <p className="text-xs text-[#C0B5A8]">Probá con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE5DC] bg-[#FAF8F4]">
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider w-12" />
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden lg:table-cell">Visible</th>
                  <th className="px-4 py-3.5 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {visibleItems.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/admin/productos/${p.id}`)}
                    className={`transition-colors cursor-pointer ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F4]/50'
                    } hover:bg-[#F4F0E8]`}
                  >
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC]">
                        {p.cloudinary_url
                          ? <img src={p.cloudinary_url} alt={p.nombre} width={36} height={36} loading="lazy" className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-[#C0B5A8]" />
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6B6159] bg-[#F4F0E8] px-1.5 py-0.5 rounded">{p.codigo}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-medium text-[#1A1613] truncate">{p.nombre}</p>
                      {p.etiqueta && <p className="text-[11px] text-[#9E9080] mt-0.5">{p.etiqueta}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[#9E9080] bg-[#FAF8F4] px-2 py-0.5 rounded-md">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge p={p} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm font-medium text-[#6B6159] tabular-nums">
                        {p.precio_usd != null ? `US$ ${Number(p.precio_usd).toLocaleString('es-AR')}` : <span className="text-[#C0B5A8]">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleDisponible(p) }}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C41B2E]/20 ${
                          p.disponible ? 'bg-emerald-500' : 'bg-[#D8D0C6]'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          p.disponible ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/admin/productos/${p.id}`) }}
                          className="p-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1] rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(p) }}
                          className="p-1.5 text-[#9E9080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-5 border-t border-[#EBE5DC] bg-[#FAF8F4]">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-sm text-[#9E9080]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando más productos...
              </div>
            ) : (
              <p className="text-xs text-[#C0B5A8] font-medium">
                Mostrando {displayCount} de {totalCount} — scrolleá para más
              </p>
            )}
          </div>
        )}

        {!hasMore && totalCount > CHUNK && (
          <div className="flex items-center justify-center py-4 border-t border-[#EBE5DC] bg-[#FAF8F4]">
            <p className="text-xs text-[#9E9080] font-medium">
              Mostrando todos los {totalCount} productos
            </p>
          </div>
        )}
      </div>

    </div>
    </>
  )
}
