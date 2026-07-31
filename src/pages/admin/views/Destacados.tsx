import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getProductos, invalidateProductosCache } from '@/lib/productosCache'
import { invalidatePublicProductsCache } from '@/hooks/useProducts'
import type { Producto } from '@/types/producto'
import { toast } from 'sonner'
import { Search, Star, Package, X, Loader2, Check, Plus, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'

const MAX_DESTACADOS = 5

export function Destacados() {
  const [allProducts, setAllProducts] = useState<Producto[]>([])
  const [loading, setLoading]         = useState(true)
  const [savingId, setSavingId]       = useState<string | null>(null)
  const [search, setSearch]           = useState('')
  const [dragIndex, setDragIndex]     = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getProductos()
    if (result.error) toast.error('Error al cargar: ' + result.error)
    setAllProducts(result.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const destacados = useMemo(
    () => allProducts
      .filter(p => p.destacado)
      .sort((a, b) => (a.destacado_orden ?? Infinity) - (b.destacado_orden ?? Infinity))
      .slice(0, MAX_DESTACADOS),
    [allProducts]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return allProducts
      .filter(p =>
        !p.destacado &&
        (p.nombre.toLowerCase().includes(q) ||
         p.codigo.toLowerCase().includes(q))
      )
      .slice(0, 20)
  }, [allProducts, search])

  const seleccionLlena = destacados.length >= MAX_DESTACADOS

  const toggleDestacado = async (producto: Producto) => {
    if (!producto.destacado && seleccionLlena) {
      toast.error(`Ya hay ${MAX_DESTACADOS} productos destacados. Quitá uno primero.`)
      return
    }

    const nextValue = !producto.destacado
    // New picks go to the end of the current order; removed ones drop their position.
    const nextOrden = nextValue
      ? Math.max(-1, ...destacados.map(p => p.destacado_orden ?? -1)) + 1
      : null

    // Optimistic update — the DB write happens in the background so the grid reacts instantly
    setAllProducts(prev => prev.map(p => p.id === producto.id ? { ...p, destacado: nextValue, destacado_orden: nextOrden } : p))
    setSavingId(producto.id)
    if (nextValue) setSearch('')

    const { error } = await supabase
      .from('products')
      .update({ destacado: nextValue, destacado_orden: nextOrden })
      .eq('id', producto.id)

    setSavingId(null)

    if (error) {
      setAllProducts(prev => prev.map(p => p.id === producto.id ? { ...p, destacado: !nextValue, destacado_orden: producto.destacado_orden } : p))
      toast.error('Error al actualizar: ' + error.message)
      return
    }

    invalidateProductosCache()
    invalidatePublicProductsCache()
    toast.success(nextValue ? 'Agregado a destacados' : 'Quitado de destacados')
  }

  const reorderDestacados = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const reordered = [...destacados]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    // Optimistic — assign sequential positions matching the new visual order
    const orderById = new Map(reordered.map((p, idx) => [p.id, idx]))
    setAllProducts(prev => prev.map(p => orderById.has(p.id) ? { ...p, destacado_orden: orderById.get(p.id)! } : p))

    const results = await Promise.all(
      reordered.map((p, idx) =>
        supabase.from('products').update({ destacado_orden: idx }).eq('id', p.id)
      )
    )

    const failed = results.find(r => r.error)
    if (failed?.error) {
      toast.error('Error al reordenar: ' + failed.error.message)
      invalidateProductosCache()
      invalidatePublicProductsCache()
      load()
      return
    }

    invalidateProductosCache()
    invalidatePublicProductsCache()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="w-6 h-6 animate-spin text-[#C41B2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-[#C41B2E] fill-[#C41B2E]" />
          Productos Destacados
        </h1>
        <p className="text-sm text-[#9E9080] mt-1">
          Seleccioná hasta <strong className="text-[#6B6159]">{MAX_DESTACADOS}</strong> productos para mostrar en el carrusel del inicio.
          {seleccionLlena && <span className="text-[#C41B2E] ml-1">Límite alcanzado.</span>}
        </p>
      </div>

      {/* 5 slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: MAX_DESTACADOS }).map((_, i) => {
          const prod = destacados[i]
          const isSaving = !!prod && savingId === prod.id
          const isDragging = prod && dragIndex === i
          const isDragOver = prod && dragOverIndex === i && dragIndex !== null && dragIndex !== i
          return (
            <div
              key={i}
              draggable={!!prod}
              onClick={!prod ? () => searchRef.current?.focus() : undefined}
              onDragStart={prod ? () => setDragIndex(i) : undefined}
              onDragOver={prod ? (e) => { e.preventDefault(); setDragOverIndex(i) } : undefined}
              onDragLeave={prod ? () => setDragOverIndex(prev => (prev === i ? null : prev)) : undefined}
              onDrop={prod ? (e) => {
                e.preventDefault()
                if (dragIndex !== null) reorderDestacados(dragIndex, i)
                setDragIndex(null)
                setDragOverIndex(null)
              } : undefined}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
              className={`group relative rounded-xl overflow-hidden transition-all duration-200 aspect-[3/4] ${
                prod
                  ? `border bg-white shadow-sm cursor-grab active:cursor-grabbing ${
                      isDragOver ? 'border-[#C41B2E] ring-2 ring-[#C41B2E]/30' : 'border-[#E8E2D9] hover:shadow-md hover:-translate-y-0.5'
                    } ${isDragging ? 'opacity-40' : ''}`
                  : 'border border-dashed border-[#D8D0C6] bg-white/50 flex items-center justify-center cursor-pointer hover:border-[#C41B2E]/40 hover:bg-[#C41B2E]/[0.02]'
              }`}
            >
              {prod ? (
                <>
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#C41B2E] text-white text-sm font-bold shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-1 rounded-md bg-white/90 text-[#C0B5A8] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => toggleDestacado(prod)}
                    disabled={isSaving}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 text-[#9E9080] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm cursor-pointer"
                    aria-label={`Quitar ${prod.nombre} de destacados`}
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  </button>
                  <div className="flex flex-col h-full">
                    <div className="flex-[3] bg-white border-b border-[#F4F0E8] overflow-hidden flex items-center justify-center p-4">
                      {prod.cloudinary_url ? (
                        <img
                          src={prod.cloudinary_url}
                          alt={prod.nombre}
                          className="w-full h-full object-contain pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-[#D8D0C6]" />
                      )}
                    </div>
                    <div className="p-3 space-y-1.5 flex-[2] flex flex-col">
                      <span className="font-mono text-[10px] text-[#9E9080] bg-[#F4F0E8] px-1.5 py-0.5 rounded self-start">{prod.codigo}</span>
                      <p className="text-sm font-semibold text-[#1A1613] line-clamp-2 leading-snug">{prod.nombre}</p>
                      <p className="text-[11px] text-[#C41B2E] font-medium uppercase tracking-wide mt-auto truncate">{prod.categoria}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Star className="w-6 h-6 text-[#D8D0C6] mx-auto mb-1 group-hover:text-[#C41B2E]/40 transition-colors" />
                  <p className="text-[11px] text-[#C0B5A8] font-medium">Slot {i + 1}</p>
                  <p className="text-[10px] text-[#D8D0C6]">Vacío</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Search to add */}
      {!seleccionLlena && (
        <div className="bg-white rounded-xl border border-[#EBE5DC] shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] z-10" />
              <Input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscá productos para agregar como destacados..."
                className="w-full pl-9 h-10 border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E]"
              />
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-[#EBE5DC] divide-y divide-[#F0EAE2] max-h-64 overflow-y-auto">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleDestacado(p)}
                  disabled={savingId === p.id}
                  className="group w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF8F4] transition-colors text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC]">
                    {p.cloudinary_url
                      ? <img src={p.cloudinary_url} alt={p.nombre} width={40} height={40} className="w-full h-full object-cover" loading="lazy" />
                      : <Package className="w-4 h-4 text-[#C0B5A8]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1613] truncate">{p.nombre}</p>
                    <span className="font-mono text-[10px] text-[#9E9080] bg-[#F4F0E8] px-1.5 py-0.5 rounded">{p.codigo}</span>
                    <span className="text-[10px] text-[#C0B5A8] ml-2">{p.categoria}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#D8D0C6] flex items-center justify-center flex-shrink-0 group-hover:border-[#C41B2E] group-hover:bg-[#C41B2E] transition-colors">
                    {savingId === p.id
                      ? <Loader2 className="w-3.5 h-3.5 text-[#C41B2E] group-hover:text-white animate-spin" />
                      : <Plus className="w-4 h-4 text-[#D8D0C6] group-hover:text-white transition-colors" />
                    }
                  </div>
                </button>
              ))}
            </div>
          )}

          {search.trim() && filtered.length === 0 && (
            <div className="px-4 py-6 text-center border-t border-[#EBE5DC]">
              <p className="text-sm text-[#C0B5A8]">No se encontraron productos</p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#EBE5DC] px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: MAX_DESTACADOS }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  destacados[i]
                    ? 'bg-[#C41B2E] text-white'
                    : 'bg-[#F0EAE2] text-[#C0B5A8]'
                }`}
              >
                {destacados[i] ? <Check className="w-3 h-3" /> : i + 1}
              </div>
            ))}
          </div>
          <span className="text-sm text-[#6B6159] font-medium">
            {destacados.length} de {MAX_DESTACADOS} seleccionados
          </span>
        </div>
        <span className="text-xs text-[#C0B5A8]">{allProducts.length} productos en total</span>
      </div>
    </div>
  )
}
