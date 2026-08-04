import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductos, getCacheAge } from '@/lib/productosCache'
import { listFamilies, listEmptyFamilies, groupProductosByFamily, SIN_ASIGNAR_ID } from '@/lib/adminFamilies'
import { type Producto, LOW_STOCK_THRESHOLD } from '@/types/producto'
import {
  Package, TrendingDown, AlertTriangle, ShoppingCart, ArrowRight, Clock,
  Layers, Eye, Folder, FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Stats {
  total: number
  familias: number
  enStock: number
  porEncargo: number
  stockBajo: number
  unicos: number
  enFamilias: number
  huerfanos: number
  familiasPendientes: number
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
    key: 'familias' as const,
    label: 'Familias',
    icon: Folder,
    gradient: 'from-[#C41B2E] to-[#E0526B]',
    bg: 'bg-[#C41B2E]',
  },
  {
    key: 'enStock' as const,
    label: 'En stock',
    icon: ShoppingCart,
    gradient: 'from-emerald-600 to-emerald-500',
    bg: 'bg-emerald-500',
  },
  {
    key: 'stockBajo' as const,
    label: 'Stock bajo',
    sub: `≤ ${LOW_STOCK_THRESHOLD} unidades`,
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-amber-400',
    bg: 'bg-orange-500',
  },
  {
    key: 'porEncargo' as const,
    label: 'Por encargo',
    icon: TrendingDown,
    gradient: 'from-amber-500 to-amber-400',
    bg: 'bg-amber-500',
  },
]

function StatCard({
  label, value, icon: Icon, gradient, sub, className = '',
}: {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  sub?: string
  className?: string
}) {
  return (
    <div className={`group relative bg-white rounded-2xl p-4 sm:p-6 border border-[#EBE5DC] hover:border-[#D8D0C4] transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(26,22,19,0.12)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4">
        <div className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-white" strokeWidth={1.8} />
          <div className="absolute inset-0 rounded-xl bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl sm:text-3xl font-bold text-[#1A1613] tabular-nums tracking-tight">{value}</p>
          <p className="text-xs sm:text-sm text-[#6B6159] font-medium mt-0.5">{label}</p>
          {sub && <p className="text-[11px] sm:text-xs text-[#9E9080] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 flex-shrink-0" />{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function CatalogStructureBars({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Productos únicos', value: stats.unicos, gradient: 'from-sky-500 to-sky-400' },
    { label: 'En familias (variantes)', value: stats.enFamilias, gradient: 'from-[#C41B2E] to-[#E0526B]' },
    { label: 'Hijos sin asignar', value: stats.huerfanos, gradient: 'from-amber-500 to-amber-400' },
  ]
  return (
    <div className="space-y-3">
      {items.map(i => (
        <div key={i.label}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-[#6B6159] font-medium">{i.label}</span>
            <span className="text-[#1A1613] font-semibold tabular-nums">
              {i.value} <span className="text-[#9E9080] font-normal">
                ({stats.total > 0 ? Math.round(i.value / stats.total * 100) : 0}%)
              </span>
            </span>
          </div>
          <div className="h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${i.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${stats.total > 0 ? i.value / stats.total * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
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
        p.stock <= LOW_STOCK_THRESHOLD / 2
          ? 'bg-orange-50 text-orange-700 border border-orange-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        {p.stock} ud.
      </div>

      <ArrowRight className="w-4 h-4 text-[#C0B5A8] group-hover:text-[#C41B2E] transition-colors flex-shrink-0" />
    </div>
  )
}

function DonutLegend({ stats }: { stats: Stats }) {
  const items = [
    { label: 'En stock', value: stats.enStock, color: '#059669', dot: 'bg-emerald-600' },
    { label: 'Por encargo', value: stats.porEncargo, color: '#D97706', dot: 'bg-amber-500' },
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

      const [result, familiesResult] = await Promise.all([
        getProductos(),
        listFamilies(),
      ])

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      const productos = result.data
      const enStock = productos.filter(p => p.stock > 0)

      // Familias = carpetas reales (es_carpeta, con o sin productos) + grupos
      // de productos que comparten familia_id con más de una variante.
      const carpetas = familiesResult.error ? [] : familiesResult.data.filter(f => f.es_carpeta === true)
      const carpetasIds = new Set(carpetas.map(f => f.id))
      const gruposMultiVariante = groupProductosByFamily(
        productos.filter(p => p.familia_id !== SIN_ASIGNAR_ID),
      ).filter(g => g.variants.length > 1 && !carpetasIds.has(g.familiaId))

      // Estructura del catálogo: únicos vs. productos dentro de familias vs.
      // hijos huérfanos (creados pero sin asignar todavía a una familia).
      const asignados = productos.filter(p => p.familia_id !== SIN_ASIGNAR_ID)
      const gruposAsignados = groupProductosByFamily(asignados)
      const esGrupoFamilia = (g: { familiaId: string; variants: Producto[] }) =>
        g.variants.length > 1 || carpetasIds.has(g.familiaId)
      const unicos     = gruposAsignados.filter(g => !esGrupoFamilia(g)).length
      const enFamilias = gruposAsignados.filter(esGrupoFamilia).reduce((n, g) => n + g.variants.length, 0)
      const huerfanos  = productos.length - asignados.length
      const familiasPendientes = familiesResult.error ? 0 : listEmptyFamilies(familiesResult.data, productos).length

      setStats({
        total:      productos.length,
        familias:   carpetas.length + gruposMultiVariante.length,
        enStock:    enStock.length,
        porEncargo: productos.filter(p => p.stock === 0).length,
        stockBajo:  enStock.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length,
        unicos,
        enFamilias,
        huerfanos,
        familiasPendientes,
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            value={stats[card.key]}
            icon={card.icon}
            gradient={card.gradient}
            sub={card.sub}
            className={card.key === 'familias' ? 'hidden sm:block' : ''}
          />
        ))}
      </div>

      {/* Middle section: health + chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Estructura del catálogo: únicos / familias / hijos sin asignar */}
        <div className="bg-white rounded-2xl border border-[#EBE5DC] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] flex items-center justify-center">
              <Layers className="w-4.5 h-4.5 text-[#C41B2E]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1613]">Estructura del catálogo</h3>
              <p className="text-xs text-[#9E9080]">Únicos, familias e hijos sin asignar</p>
            </div>
          </div>

          <CatalogStructureBars stats={stats} />

          {stats.familiasPendientes > 0 && (
            <button
              onClick={() => navigate('/admin/productos')}
              className="mt-4 w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#FFF8F5] border border-[#F5C6BA] hover:bg-[#FFF0EA] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-xs font-medium text-[#C41B2E]">
                <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                {stats.familiasPendientes} familia{stats.familiasPendientes !== 1 ? 's' : ''} pendiente{stats.familiasPendientes !== 1 ? 's' : ''} · sin productos todavía
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C41B2E] flex-shrink-0" />
            </button>
          )}
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

      {alerts.length === 0 && (
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
