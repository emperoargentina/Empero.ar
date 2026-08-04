// src/components/admin/CreateFamilyModal.tsx
import { useEffect, useState } from 'react'
import { Loader2, FolderPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
          <DialogDescription className="text-xs text-[#9E9080]">
            Solo el nombre — es una carpeta vacía hasta que le agregues productos hijo. La categoría se toma del primer producto que le agregues.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-5">
          <Label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#9E9080]">Nombre *</Label>
          <Input
            autoFocus
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleConfirm() } }}
            placeholder="Ej: Lavavajillas Industrial LV-500"
            className="border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] h-10 focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E]"
          />
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
            disabled={!nombre.trim() || submitting}
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
              : 'Crear familia'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
