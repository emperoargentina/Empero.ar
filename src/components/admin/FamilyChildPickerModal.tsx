// src/components/admin/FamilyChildPickerModal.tsx
import { useEffect, useMemo, useState } from 'react'
import { Search, Package, Loader2, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Producto } from '@/types/producto'
import type { ProductFamily } from '@/types/family'

interface FamilyChildPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  family: ProductFamily
  unassigned: Producto[]
  onConfirm: (productIds: string[], categoria: string) => Promise<void>
}

export function FamilyChildPickerModal({
  open, onOpenChange, family, unassigned, onConfirm,
}: FamilyChildPickerModalProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) { setQuery(''); setSelected(new Set()) }
  }, [open])

  // Mientras la familia no tenga categoría propia, la fija el primer lote
  // que se le agregue — no se puede mezclar categorías en esa selección.
  const lockedCategoria = family.categoria
    ?? (selected.size > 0 ? unassigned.find(p => selected.has(p.id))?.categoria ?? null : null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return unassigned.filter(p => {
      if (q && !p.nombre.toLowerCase().includes(q) && !p.codigo.toLowerCase().includes(q)) return false
      return true
    })
  }, [unassigned, query])

  const toggle = (p: Producto) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(p.id)) next.delete(p.id)
      else next.add(p.id)
      return next
    })
  }

  const handleConfirm = async () => {
    if (selected.size === 0 || !lockedCategoria) return
    setSubmitting(true)
    await onConfirm(Array.from(selected), lockedCategoria)
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#EBE5DC] max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[#EBE5DC] text-left">
          <DialogTitle className="text-base font-bold text-[#1A1613] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#C41B2E]" />
            Agregar producto hijo a «{family.nombre}»
          </DialogTitle>
          <p className="text-xs text-[#9E9080]">
            {family.categoria
              ? `Solo se muestran hijos de categoría "${family.categoria}"`
              : 'La categoría de la familia se toma del primer lote que agregues'}
          </p>
        </DialogHeader>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] z-10" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-9 h-10 border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E]"
            />
          </div>
        </div>

        <div className="px-5 py-4 max-h-80 overflow-y-auto space-y-1.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center">
                <Package className="w-5 h-5 text-[#C0B5A8]" />
              </div>
              <p className="text-sm text-[#9E9080]">No hay productos hijo disponibles.</p>
            </div>
          ) : (
            filtered.map(p => {
              const isSelected = selected.has(p.id)
              const mismatched = lockedCategoria != null && p.categoria !== lockedCategoria
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                    mismatched
                      ? 'opacity-40 cursor-not-allowed border-[#EBE5DC]'
                      : isSelected
                        ? 'border-[#C41B2E]/50 bg-[#FFF0F1] cursor-pointer'
                        : 'border-[#EBE5DC] hover:bg-[#FAF8F4] cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={mismatched}
                    onChange={() => toggle(p)}
                    className="w-4 h-4 accent-[#C41B2E] rounded flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="w-9 h-9 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC]">
                    {p.cloudinary_url
                      ? <img src={p.cloudinary_url} alt={p.nombre} className="w-full h-full object-cover" />
                      : <Package className="w-4 h-4 text-[#C0B5A8]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1613] truncate">{p.nombre}</p>
                    <p className="text-[11px] text-[#9E9080] flex items-center gap-1.5">
                      <span className="font-mono">{p.codigo}</span>
                      <span>·</span>
                      <span>{p.categoria}</span>
                    </p>
                  </div>
                </label>
              )
            })
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-[#EBE5DC] bg-[#FAF8F4]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[#6B6159] hover:bg-[#F4F0E8]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={handleConfirm}
            disabled={selected.size === 0 || submitting}
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Agregando...</>
              : `Agregar${selected.size > 0 ? ` (${selected.size})` : ''}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
