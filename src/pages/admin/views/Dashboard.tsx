import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductos, getCacheAge } from '@/lib/productosCache'
import { type Producto, LOW_STOCK_THRESHOLD } from '@/types/producto'
import {
  Package, TrendingDown, AlertTriangle, ShoppingCart, XCircle, ArrowRight, Clock,
  TrendingUp, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Stats {
  total: number
  enStock: number
  porEncargo: number
  stockBajo: number
  sinStock: number
}

const STAT_CARDS = [
  {
    key: 'total' as const,
    label: 'Total productos',
    icon: Package,
    gradient: 'from-[#1A1613] to-[#2A2623]',
    bg: 'bg-[#1A1613]',
  },
  {
    key: 'enStock' as const,
    label: 'En stock',
    icon: ShoppingCart,
    gradient: 'from-emerald-600 to-emerald-500',
    bg: 'bg-emerald-500',
  },
  {
    key: 'porEncargo' as const,
    label: 'Por encargo',
    icon: TrendingDown,
    gradient: 'from-amber-500 to-amber-400',
    bg: 'bg-amber-500',
  },
  {
    key: 'sinStock' as const,
    label: 'Sin stock',
    icon: XCircle,
    gradient: 'from-red-500 to-rose-400',
    bg: 'bg-red-500',
  },
]

function StatCard({
  label, value, icon: Icon, gradient, sub,
}: {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  sub?: string
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-[#EBE5DC] hover:border-[#D8D0C4] transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(26,22,19,0.12)]">
      <div className="flex items-start gap-4">
        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-5.5 h-5.5 text-white" strokeWidth={1.8} />
          <div className="absolute inset-0 rounded-xl bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-bold text-[#1A1613] tabular-nums tracking-tight">{value}</p>
          <p className="text-sm text-[#6B6159] font-medium mt-0.5">{label}</p>
          {sub && <p className="text-xs text-[#9E9080] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function DonutChart({ stats }: { stats: Stats }) {
  const cx = 80, cy = 80, r = 56, sw = 22
  const circ = 2 * Math.PI * r
  const pad = 3

  const segments = [
    { label: 'En stock', value: stats.enStock, color: '#059669' },
    { label: 'Por encargo', value: stats.porEncargo, color: '#D97706' },
    { label: 'Sin stock', value: stats.sinStock, color: '#DC2626' },
  ].filter(s => s.value > 0)

  const total = segments.reduce((a, s) => a + s.value, 0)

  let offset = 0
  const arcs = segments.map(s => {
    const p = s.value / total
    const len = p * (circ - segments.length * pad)
    const dash = `${len} ${circ - len}`
    const o = -offset
    offset += len + pad
    return { ...s, dash, offset: o, pct: Math.round(p * 100) }
  })

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F4F0E8" strokeWidth={sw} />
      {arcs.map(a => (
        <circle
          key={a.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={sw}
          strokeDasharray={a.dash}
          strokeDashoffset={a.offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      ))}
    </svg>
  )
}

function AlertRow({ p }: { p: Producto }) {
  const navigate = useNavigate()
  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAF8F4] transition-colors cursor-pointer group border-b border-[#F4F0E8] last:border-0"
      onClick={() => navigate('/admin/productos')}
    >
      <div className="w-10 h-10 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC] group-hover:border-[#D8D0C4] transition-colors">
        {p.cloudinary_url
          ? <img src={p.cloudinary_url} alt={p.nombre} width={40} height={40} loading="lazy" className="w-full h-full object-cover" />
          : <Package className="w-5 h-5 text-[#C0B5A8]" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1613] truncate">{p.nombre}</p>
        <p className="text-xs text-[#9E9080] mt-0.5">
          <span className="font-mono">{p.codigo}</span>
          {p.categoria && <><span className="mx-1.5">·</span>{p.categoria}</>}
        </p>
      </div>

      <div className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
        p.stock === 0
          ? 'bg-red-50 text-red-600 border border-red-200'
          : p.stock <= LOW_STOCK_THRESHOLD / 2
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        {p.stock === 0 ? '0 ud.' : `${p.stock} ud.`}
      </div>

      <ArrowRight className="w-4 h-4 text-[#C0B5A8] group-hover:text-[#C41B2E] transition-colors flex-shrink-0" />
    </div>
  )
}

function DonutLegend({ stats }: { stats: Stats }) {
  const items = [
    { label: 'En stock', value: stats.enStock, color: '#059669', dot: 'bg-emerald-600' },
    { label: 'Por encargo', value: stats.porEncargo, color: '#D97706', dot: 'bg-amber-500' },
    { label: 'Sin stock', value: stats.sinStock, color: '#DC2626', dot: 'bg-red-600' },
  ]
  return (
    <div className="space-y-2.5">
      {items.map(i => (
        <div key={i.label} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${i.dot} flex-shrink-0`} />
            <span className="text-sm text-[#6B6159]">{i.label}</span>
          </div>
          <span className="text-sm font-semibold text-[#1A1613] tabular-nums">
            {i.value}
            <span className="text-[#9E9080] font-normal ml-1">
              ({stats.total > 0 ? Math.round(i.value / stats.total * 100) : 0}%)
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const navigate              = useNavigate()
  const [stats, setStats]       = useState<Stats | null>(null)
  const [alerts, setAlerts]     = useState<Producto[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [cacheAge, setCacheAge] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const result = await getProductos()

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      const productos = result.data
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

      setFromCache(result.fromCache)
      setCacheAge(getCacheAge())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[2.5px] border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9E9080] font-medium">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-red-200 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-rose-400" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1613]">Error al cargar datos</h2>
                <p className="text-xs text-[#9E9080] mt-0.5">Verificá la conexión con Supabase</p>
              </div>
            </div>
            <p className="text-xs text-red-500 font-mono bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#9E9080] mt-1">Resumen del inventario en tiempo real</p>
        </div>
        {fromCache && cacheAge !== null && (
          <div className="flex items-center gap-1.5 text-xs text-[#9E9080] bg-white/80 backdrop-blur-sm border border-[#EBE5DC] rounded-lg px-3 py-1.5 flex-shrink-0 shadow-sm">
            <Clock className="w-3 h-3" />
            Caché · hace {cacheAge} min
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            value={stats[card.key]}
            icon={card.icon}
            gradient={card.gradient}
            sub={card.key === 'sinStock' && stats.sinStock > 0 ? 'requieren atención' : undefined}
          />
        ))}
      </div>

      {/* Middle section: health + chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Health bars */}
        <div className="bg-white rounded-2xl border border-[#EBE5DC] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1613]">Salud del inventario</h3>
              <p className="text-xs text-[#9E9080]">Distribución de productos</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-[#6B6159] font-medium">En stock</span>
                <span className="text-[#1A1613] font-semibold">{Math.round(stats.enStock / stats.total * 100)}%</span>
              </div>
              <div className="h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${stats.enStock / stats.total * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-[#6B6159] font-medium">Por encargo</span>
                <span className="text-[#1A1613] font-semibold">{Math.round(stats.porEncargo / stats.total * 100)}%</span>
              </div>
              <div className="h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500" style={{ width: `${stats.porEncargo / stats.total * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-[#6B6159] font-medium">Sin stock</span>
                <span className="text-[#1A1613] font-semibold">{Math.round(stats.sinStock / stats.total * 100)}%</span>
              </div>
              <div className="h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-rose-300 rounded-full transition-all duration-500" style={{ width: `${stats.sinStock / stats.total * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-[#EBE5DC] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#1A1613]/5 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-[#6B6159]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1613]">Distribución general</h3>
              <p className="text-xs text-[#9E9080]">Proporción del inventario</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0 relative">
              <DonutChart stats={stats} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1A1613] tabular-nums">{stats.total}</p>
                  <p className="text-[10px] text-[#9E9080] font-medium uppercase tracking-wider">Total</p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DonutLegend stats={stats} />
            </div>
          </div>
        </div>
      </div>

      {/* Low stock banner */}
      {stats.stockBajo > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200 rounded-xl">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(251,191,36,0.03)_20px,rgba(251,191,36,0.03)_21px)]" />
          <div className="relative flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <p className="text-sm text-amber-800 font-medium flex-1">
              {stats.stockBajo} producto{stats.stockBajo !== 1 ? 's' : ''} con stock bajo (≤ {LOW_STOCK_THRESHOLD} unidades)
              {stats.sinStock > 0 && <span className="text-amber-600 font-normal"> · {stats.sinStock} agotados</span>}
            </p>
          </div>
        </div>
      )}

      {/* Alerts section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE5DC] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE5DC] bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1613] text-sm">Productos con stock crítico</h2>
                <p className="text-[11px] text-[#9E9080]">{alerts.length} producto{alerts.length !== 1 ? 's' : ''} por revisar</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/productos')}
              className="text-xs text-[#C41B2E] hover:text-[#B51426] font-semibold bg-[#FFF0F1] hover:bg-[#FFE4E6] rounded-lg"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.map(p => (
              <AlertRow key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && stats.sinStock === 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Todo en orden</p>
              <p className="text-xs text-emerald-600 mt-0.5">No hay alertas de stock pendientes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
