// src/pages/admin/modals/ProductModal.tsx  (stub)
import type { Producto } from '@/types/producto'
interface Props {
  producto: Producto | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}
export function ProductModal({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8">
        Modal stub <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
