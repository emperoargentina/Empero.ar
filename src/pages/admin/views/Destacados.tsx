import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getProductos, invalidateProductosCache } from '@/lib/productosCache'
import type { Producto } from '@/types/producto'
import { toast } from 'sonner'
import { Search, Star, Package, X, Loader2, Check } from 'lucide-react'

const MAX_DESTACADOS = 5

export function Destacados() {
  const [allProducts, setAllProducts] = useState<Producto[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getProductos(true)
    if (result.error) toast.error('Error al cargar: ' + result.error)
    setAllProducts(result.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const destacados = useMemo(
    () => allProducts.filter(p => p.destacado).slice(0, MAX_DESTACADOS),
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

    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({ destacado: !producto.destacado })
      .eq('id', producto.id)

    if (error) {
      toast.error('Error al actualizar: ' + error.message)
      setSaving(false)
      return
    }

    invalidateProductosCache()
    await load()
    setSaving(false)
    setSearch('')
    toast.success(producto.destacado ? 'Quitado de destacados' : 'Agregado a destacados')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="w-6 h-6 animate-spin text-[#C41B2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          Productos Destacados
        </h1>
        <p className="text-sm text-[#9E9080] mt-1">
          Seleccioná hasta <strong className="text-[#6B6159]">{MAX_DESTACADOS}</strong> productos para mostrar en el carrusel del inicio.
          {seleccionLlena && <span className="text-amber-600 ml-1">Límite alcanzado.</span>}
        </p>
      </div>

      {/* 5 slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: MAX_DESTACADOS }).map((_, i) => {
          const prod = destacados[i]
          return (
            <div
              key={i}
              className={`relative rounded-xl border-2 overflow-hidden transition-all min-h-[200px] ${
                prod
                  ? 'border-amber-200 bg-white shadow-sm'
                  : 'border-dashed border-[#D8D0C6] bg-white/50 flex items-center justify-center'
              }`}
            >
              {prod ? (
                <>
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDestacado(prod)}
                    disabled={saving}
                    className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-white/90 text-[#9E9080] hover:text-red-500 hover:bg-red-50 transition-all shadow-sm cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col h-full">
                    <div className="aspect-[4/3] bg-[#F0EAE2] overflow-hidden flex items-center justify-center">
                      {prod.cloudinary_url ? (
                        <img
                          src={prod.cloudinary_url}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-[#D8D0C6]" />
                      )}
                    </div>
                    <div className="p-3 space-y-1 flex-1 flex flex-col">
                      <span className="font-mono text-[10px] text-[#9E9080] bg-[#F4F0E8] px-1.5 py-0.5 rounded self-start">{prod.codigo}</span>
                      <p className="text-xs font-medium text-[#1A1613] line-clamp-2 leading-snug">{prod.nombre}</p>
                      <p className="text-[10px] text-[#C0B5A8] mt-auto">{prod.categoria}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Star className="w-6 h-6 text-[#D8D0C6] mx-auto mb-1" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscá productos para agregar como destacados..."
                className="w-full pl-9 pr-4 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all"
              />
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-[#EBE5DC] divide-y divide-[#F0EAE2] max-h-64 overflow-y-auto">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleDestacado(p)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF8F4] transition-colors text-left cursor-pointer"
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
                  <div className="w-8 h-8 rounded-full border-2 border-[#D8D0C6] flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-[#D8D0C6]" />
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
                    ? 'bg-amber-500 text-white'
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
