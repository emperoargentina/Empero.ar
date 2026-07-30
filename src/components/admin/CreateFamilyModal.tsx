// src/components/admin/CreateFamilyModal.tsx
import { useEffect, useState } from 'react'
import { Loader2, FolderPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface CreateFamilyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (nombre: string) => Promise<void>
}

export function CreateFamilyModal({ open, onOpenChange, onConfirm }: CreateFamilyModalProps) {
  const [nombre, setNombre] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) setNombre('')
  }, [open])

  const handleConfirm = async () => {
    if (!nombre.trim()) return
    setSubmitting(true)
    await onConfirm(nombre.trim())
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#EBE5DC] max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[#EBE5DC] text-left">
          <DialogTitle className="text-base font-bold text-[#1A1613] flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[#C41B2E]" />
            Crear familia
          </DialogTitle>
          <p className="text-xs text-[#9E9080]">
            Solo el nombre — es una carpeta vacía hasta que le agregues productos hijo. La categoría se toma del primer producto que le agregues.
          </p>
        </DialogHeader>

        <div className="px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#9E9080]">Nombre *</p>
          <input
            autoFocus
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleConfirm() } }}
            placeholder="Ej: Lavavajillas Industrial LV-500"
            className="w-full px-3 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[rgba(196,27,46,0.1)] transition-all placeholder:text-[#C0B5A8] bg-white"
          />
        </div>

        <DialogFooter className="px-5 py-4 border-t border-[#EBE5DC] bg-[#FAF8F4]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B6159] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!nombre.trim() || submitting}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
              : 'Crear familia'
            }
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
