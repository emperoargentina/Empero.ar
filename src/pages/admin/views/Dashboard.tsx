// src/pages/admin/views/Dashboard.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Producto, LOW_STOCK_THRESHOLD } from '@/types/producto'
import type { AdminView } from '../AdminPanel'
import {
  Package, TrendingDown, AlertTriangle, ShoppingCart, XCircle, ArrowRight,
} from 'lucide-react'

interface Props { onNavigate: (v: AdminView) => void }

interface Stats {
  total: number
  enStock: number
  porEncargo: number
  stockBajo: number
  sinStock: number
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EBE5DC] flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1A1613] tabular-nums">{value}</p>
        <p className="text-sm text-[#6B6159] font-medium leading-tight mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[#9E9080] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function Dashboard({ onNavigate }: Props) {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [alerts, setAlerts]   = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('productos').select('*')

      if (error || !data) { setLoading(false); return }

      const productos = data as Producto[]
      const enStock = productos.filter(p => p.modo_disponibilidad === 'en_stock')

      setStats({
        total:      productos.length,
        enStock:    enStock.filter(p => p.stock > 0).length,
        porEncargo: productos.filter(p => p.modo_disponibilidad === 'por_encargo').length,
        stockBajo:  enStock.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
        sinStock:   enStock.filter(p => p.stock === 0).length,
      })

      setAlerts(
        enStock
          .filter(p => p.stock <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 20),
      )

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-[#6B6159] text-sm">Error cargando estadísticas.</p>
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1613]">Dashboard</h1>
        <p className="text-sm text-[#9E9080] mt-1">Resumen del inventario en tiempo real</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total productos" value={stats.total}      icon={Package}      color="bg-[#F4F0E8] text-[#6B6159]" />
        <StatCard label="En stock"        value={stats.enStock}    icon={ShoppingCart} color="bg-green-50 text-green-600" />
        <StatCard label="Por encargo"     value={stats.porEncargo} icon={TrendingDown}  color="bg-blue-50 text-blue-500" />
        <StatCard label="Sin stock"       value={stats.sinStock}   icon={XCircle}      color="bg-red-50 text-red-500"
          sub={stats.sinStock > 0 ? 'requieren atención' : undefined} />
      </div>

      {/* Low stock banner */}
      {stats.stockBajo > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            {stats.stockBajo} producto{stats.stockBajo !== 1 ? 's' : ''} con stock bajo (≤ {LOW_STOCK_THRESHOLD} unidades)
          </p>
        </div>
      )}

      {/* Alerts table */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE5DC] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE5DC]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-[#1A1613] text-sm">Productos con stock crítico</h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-[#C41B2E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#F4F0E8]">
            {alerts.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAF8F4] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden">
                  {p.cloudinary_url
                    ? <img src={p.cloudinary_url} alt={p.nombre} className="w-full h-full object-cover" />
                    : <Package className="w-5 h-5 text-[#C0B5A8] m-auto mt-2.5" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1613] truncate">{p.nombre}</p>
                  <p className="text-xs text-[#9E9080]">{p.codigo} · {p.categoria}</p>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  p.stock === 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} ud.`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && stats.sinStock === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-sm text-green-700 font-medium">
            Todo el inventario está en buen estado. No hay alertas de stock.
          </p>
        </div>
      )}
    </div>
  )
}
