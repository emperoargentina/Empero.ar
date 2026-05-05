// src/pages/admin/views/Products.tsx
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS, LOW_STOCK_THRESHOLD } from '@/types/producto'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, Package, AlertTriangle,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import { ProductModal } from '../modals/ProductModal'

const PAGE_SIZE = 20

function StockBadge({ p }: { p: Producto }) {
  if (p.modo_disponibilidad === 'por_encargo') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
        Por encargo
      </span>
    )
  }
  if (p.stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
        Sin stock
      </span>
    )
  }
  if (p.stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="w-3 h-3" /> {p.stock} ud.
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
      {p.stock} ud.
    </span>
  )
}

export function Products() {
  const [productos, setProductos]   = useState<Producto[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [categoria, setCategoria]   = useState('')
  const [modo, setModo]             = useState<'all' | 'en_stock' | 'por_encargo'>('all')
  const [page, setPage]             = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<Producto | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .order('nombre')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (search.trim()) query = query.ilike('nombre', `%${search.trim()}%`)
    if (categoria)     query = query.eq('categoria', categoria)
    if (modo !== 'all') query = query.eq('modo_disponibilidad', modo)

    const { data, count, error } = await query

    if (error) { toast.error('Error al cargar productos'); setLoading(false); return }
    setProductos((data ?? []) as Producto[])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [page, search, categoria, modo])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, categoria, modo])

  const handleDelete = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('productos').delete().eq('id', p.id)
    if (error) { toast.error('Error al eliminar producto'); return }
    toast.success('Producto eliminado')
    load()
  }

  const handleToggleDisponible = async (p: Producto) => {
    const { error } = await supabase
      .from('productos')
      .update({ disponible: !p.disponible })
      .eq('id', p.id)
    if (error) { toast.error('Error al actualizar disponibilidad'); return }
    toast.success(`Producto ${!p.disponible ? 'activado' : 'desactivado'}`)
    load()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1613]">Productos</h1>
          <p className="text-sm text-[#9E9080] mt-0.5">{totalCount} productos en total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C41B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#B51426] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#EBE5DC] p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-4 py-2 border border-[#EBE5DC] rounded-lg text-sm focus:outline-none focus:border-[#C41B2E] transition-colors"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8]" />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="pl-8 pr-8 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] cursor-pointer appearance-none bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <select
          value={modo}
          onChange={e => setModo(e.target.value as typeof modo)}
          className="px-3 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] cursor-pointer appearance-none bg-white"
        >
          <option value="all">Todos los modos</option>
          <option value="en_stock">En stock</option>
          <option value="por_encargo">Por encargo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE5DC] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#9E9080]">
            <Package className="w-8 h-8" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE5DC] bg-[#FAF8F4]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide w-12" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden lg:table-cell">Visible</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0E8]">
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F4] transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden">
                        {p.cloudinary_url
                          ? <img src={p.cloudinary_url} alt={p.nombre} className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-[#C0B5A8] m-auto mt-2.5" />
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6B6159]">{p.codigo}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-medium text-[#1A1613] truncate">{p.nombre}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[#9E9080]">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge p={p} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-[#6B6159] tabular-nums">
                      {p.precio_usd != null ? `US$ ${Number(p.precio_usd).toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${p.disponible ? 'bg-green-500' : 'bg-[#D8D0C6]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${p.disponible ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true) }}
                          className="p-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#F4F0E8] rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-[#9E9080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EBE5DC]">
            <p className="text-xs text-[#9E9080]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs font-medium text-[#1A1613]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        producto={editing}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={() => { setModalOpen(false); setEditing(null); load() }}
      />
    </div>
  )
}
