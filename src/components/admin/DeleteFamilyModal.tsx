// src/components/admin/DeleteFamilyModal.tsx
import { useState } from 'react'
import { Loader2, Trash2, FolderX, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteFamilyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familyName: string
  productCount: number
  onKeepProducts: () => Promise<void>
  onDeleteProducts: () => Promise<void>
}

export function DeleteFamilyModal({
  open, onOpenChange, familyName, productCount, onKeepProducts, onDeleteProducts,
}: DeleteFamilyModalProps) {
  const [submitting, setSubmitting] = useState<'keep' | 'cascade' | null>(null)

  const handleKeep = async () => {
    setSubmitting('keep')
    await onKeepProducts()
    setSubmitting(null)
  }

  const handleCascade = async () => {
    setSubmitting('cascade')
    await onDeleteProducts()
    setSubmitting(null)
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!submitting) onOpenChange(next) }}>
      <DialogContent className="bg-white border-[#EBE5DC] max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[#EBE5DC] text-left">
          <DialogTitle className="text-base font-bold text-[#1A1613] flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-[#C41B2E]" />
            Eliminar familia «{familyName}»
          </DialogTitle>
          <p className="text-xs text-[#9E9080]">
            {productCount > 0
              ? `Tiene ${productCount} producto${productCount !== 1 ? 's' : ''} vinculado${productCount !== 1 ? 's' : ''}. Elegí qué hacer con ${productCount !== 1 ? 'ellos' : 'él'}.`
              : 'Esta familia no tiene productos vinculados.'}
          </p>
        </DialogHeader>

        <div className="px-5 py-4 space-y-2.5">
          <button
            type="button"
            onClick={handleCascade}
            disabled={submitting !== null}
            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              {submitting === 'cascade'
                ? <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                : <AlertTriangle className="w-4 h-4 text-red-600" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Borrar familia y productos</p>
              <p className="text-xs text-red-500 mt-0.5">Elimina también los {productCount} producto{productCount !== 1 ? 's' : ''} vinculado{productCount !== 1 ? 's' : ''}. No se puede deshacer.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleKeep}
            disabled={submitting !== null}
            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-[#EBE5DC] hover:bg-[#FAF8F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F4F0E8] flex items-center justify-center flex-shrink-0 mt-0.5">
              {submitting === 'keep'
                ? <Loader2 className="w-4 h-4 text-[#6B6159] animate-spin" />
                : <FolderX className="w-4 h-4 text-[#6B6159]" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1613]">Solo borrar la carpeta</p>
              <p className="text-xs text-[#9E9080] mt-0.5">Los productos se desvinculan y pasan a ser hijos huérfanos sin familia.</p>
            </div>
          </button>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-[#EBE5DC] bg-[#FAF8F4]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting !== null}
            className="text-[#6B6159] hover:bg-[#F4F0E8]"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
