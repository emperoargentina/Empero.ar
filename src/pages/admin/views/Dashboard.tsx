// src/pages/admin/views/Dashboard.tsx  (stub)
import type { AdminView } from '../AdminPanel'
interface Props { onNavigate: (v: AdminView) => void }
export function Dashboard({ onNavigate }: Props) {
  return <div className="p-4">Dashboard stub <button onClick={() => onNavigate('products')}>→ Products</button></div>
}
