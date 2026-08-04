import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getProductos, invalidateProductosCache, getCacheAge } from '@/lib/productosCache'
import {
  groupProductosByFamily, listUnassignedChildren, listEmptyFamilies,
  listFamilies, createEmptyFamily, addChildrenToFamily, SIN_ASIGNAR_ID,
  deleteFamilyKeepProducts, deleteFamilyWithProducts, deleteFamily,
  type FamilyGroup,
} from '@/lib/adminFamilies'
import { type Producto, CATEGORIAS, LOW_STOCK_THRESHOLD } from '@/types/producto'
import { disponibilidadDeStock } from '@/lib/availability'
import { CATEGORIA_ICONS } from '@/lib/categoriaIcons'
import type { ProductFamily } from '@/types/family'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, Package, AlertTriangle,
  Filter, Clock, ChevronRight, Layers, X, ArrowUpDown,
  Loader2, FolderPlus, FolderOpen, ShoppingCart, TrendingDown,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { CreateFamilyModal } from '@/components/admin/CreateFamilyModal'
import { FamilyChildPickerModal } from '@/components/admin/FamilyChildPickerModal'
import { DeleteFamilyModal } from '@/components/admin/DeleteFamilyModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'

const CHUNK = 30

const BADGE_CLS = 'inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm w-28'

function StockBadge({ p }: { p: Producto }) {
  const unidad = p.stock === 1 ? 'unidad' : 'unidades'
  if (p.stock === 0) {
    return (
      <Badge variant="outline" className={`${BADGE_CLS} bg-amber-50 text-amber-700 border-amber-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Por encargo
      </Badge>
    )
  }
  if (p.stock <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge variant="outline" className={`${BADGE_CLS} bg-red-50 text-red-600 border-red-200`}>
        <AlertTriangle className="w-3 h-3 text-red-500" />
        {p.stock} {unidad}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`${BADGE_CLS} bg-emerald-50 text-emerald-700 border-emerald-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {p.stock} {unidad}
    </Badge>
  )
}

function FamilyAvailabilityBadge({ variants }: { variants: Producto[] }) {
  const hasStock = variants.some(v => v.stock > 0)
  const hasBackorder = variants.some(v => v.stock === 0)

  if (hasStock && hasBackorder) {
    return (
      <Badge variant="outline" className={`${BADGE_CLS} bg-sky-50 text-sky-700 border-sky-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        Ambas
      </Badge>
    )
  }
  if (hasBackorder) {
    return (
      <Badge variant="outline" className={`${BADGE_CLS} bg-amber-50 text-amber-700 border-amber-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Por encargo
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`${BADGE_CLS} bg-emerald-50 text-emerald-700 border-emerald-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      En stock
    </Badge>
  )
}

function ProductRow({
  p, index, nested, variantIndex = 0, isFirst, isLast, onNavigate, onToggle, onDelete,
}: {
  p: Producto
  index: number
  nested?: boolean
  variantIndex?: number
  isFirst?: boolean
  isLast?: boolean
  onNavigate: (id: string) => void
  onToggle: (p: Producto) => void
  onDelete: (p: Producto) => void
}) {
  const cellY = nested
    ? `${isFirst ? 'border-t border-[#C41B2E]/30' : ''} ${isLast ? 'border-b border-[#C41B2E]/30' : ''}`
    : ''

  return (
    <motion.tr
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: nested ? variantIndex * 0.035 : Math.min(index, 8) * 0.02 }}
      onClick={() => onNavigate(p.id)}
      className={`transition-colors cursor-pointer ${
        nested
          ? 'bg-gradient-to-r from-[#FFF4F1] to-[#FFFBFA] hover:from-[#FFE9E4] hover:to-[#FFF4F1]'
          : `${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F4]/50'} hover:bg-[#F4F0E8]`
      }`}
    >
      <td className={`px-4 py-3 ${cellY} ${nested ? 'pl-10 relative border-l border-[#C41B2E]/30' : ''}`}>
        {nested && <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-[#C41B2E]/40" />}
        <div className="w-9 h-9 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC]">
          {p.cloudinary_url
            ? <img src={p.cloudinary_url} alt={p.nombre} width={36} height={36} loading="lazy" className="w-full h-full object-cover" />
            : <Package className="w-4 h-4 text-[#C0B5A8]" />
          }
        </div>
      </td>
      <td className={`px-4 py-3 overflow-hidden ${cellY}`}>
        <p className="font-medium text-[#1A1613] truncate">{p.nombre}</p>
        {p.etiqueta && <p className="text-[11px] text-[#4A4540] mt-0.5 truncate">{p.etiqueta}</p>}
      </td>
      <td className={`px-4 py-3 ${cellY}`}>
        <span className="font-mono text-xs text-[#1A1613] bg-[#F4F0E8] px-1.5 py-0.5 rounded whitespace-nowrap">{p.codigo}</span>
      </td>
      <td className={`px-4 py-3 hidden md:table-cell overflow-hidden ${cellY}`}>
        <span className="text-xs text-[#1A1613] bg-[#FAF8F4] px-2 py-0.5 rounded-md inline-block max-w-full truncate align-bottom">{p.categoria}</span>
      </td>
      <td className={`px-4 py-3 ${cellY}`}>
        <StockBadge p={p} />
      </td>
      <td className={`px-4 py-3 hidden sm:table-cell ${cellY}`}>
        <span className="text-sm font-medium text-[#1A1613] tabular-nums whitespace-nowrap">
          {p.precio_usd != null ? `US$ ${Number(p.precio_usd).toLocaleString('es-AR')}` : <span className="text-[#C0B5A8]">—</span>}
        </span>
      </td>
      <td className={`px-4 py-3 hidden lg:table-cell ${cellY}`}>
        <Switch
          checked={p.disponible}
          onClick={e => e.stopPropagation()}
          onCheckedChange={() => onToggle(p)}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-[#D8D0C6]"
        />
      </td>
      <td className={`px-4 py-3 ${cellY} ${nested ? 'border-r border-[#C41B2E]/30' : ''}`}>
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={e => { e.stopPropagation(); onNavigate(p.id) }}
            className="text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1]"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={e => { e.stopPropagation(); onDelete(p) }}
            className="text-[#9E9080] hover:text-red-500 hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

function FamilyHeaderRow({
  group, family, index, expanded, onToggle, onToggleVisible, onAddChild, onDelete,
}: {
  group: FamilyGroup
  family: ProductFamily | undefined
  index: number
  expanded: boolean
  onToggle: () => void
  onToggleVisible: () => void
  onAddChild: () => void
  onDelete: () => void
}) {
  const rep = group.variants[0]
  // El nombre/categoría/imagen del grupo son los de la familia — cada
  // variante conserva su propia identidad, no se usa como representante.
  const displayNombre = family?.nombre ?? rep.nombre
  const displayCategoria = family?.categoria ?? rep.categoria
  const displayImagen = family?.cloudinary_url ?? rep.cloudinary_url
  const prices = group.variants.map(v => v.precio_usd).filter((v): v is number => v != null)
  const priceLabel = prices.length === 0
    ? null
    : Math.min(...prices) === Math.max(...prices)
      ? `US$ ${Math.min(...prices).toLocaleString('es-AR')}`
      : `US$ ${Math.min(...prices).toLocaleString('es-AR')}–${Math.max(...prices).toLocaleString('es-AR')}`
  const allVisible = group.variants.every(v => v.disponible)
  const cellY = expanded ? 'border-y-2 border-[#C41B2E]/60' : 'border-y-2 border-transparent'

  return (
    <motion.tr
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 8) * 0.02 }}
      onClick={onToggle}
      className={`transition-colors duration-200 cursor-pointer ${
        expanded
          ? 'bg-[#FFE1D6] hover:bg-[#FFD4C5]'
          : `${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F4]/50'} hover:bg-[#F4F0E8]`
      }`}
    >
      <td className={`px-4 py-3 ${cellY} ${expanded ? 'border-l-2 border-[#C41B2E]/60' : ''}`}>
        <div className={`w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border transition-colors ${
          expanded ? 'bg-[#FFD1C0] border-[#F0A088]' : 'bg-[#F4F0E8] border-[#EBE5DC]'
        }`}>
          {displayImagen
            ? <img src={displayImagen} alt={displayNombre} width={36} height={36} loading="lazy" className="w-full h-full object-cover" />
            : <Package className="w-4 h-4 text-[#C0B5A8]" />
          }
        </div>
      </td>
      <td className={`px-4 py-3 overflow-hidden ${cellY}`}>
        <p className="font-semibold text-[#1A1613] truncate">{displayNombre}</p>
        <p className="text-[11px] text-[#4A4540] mt-0.5 flex items-center gap-1 truncate">
          <Layers className="w-3 h-3 text-[#C41B2E] flex-shrink-0" /> {group.variants.length} variante{group.variants.length !== 1 ? 's' : ''}
        </p>
      </td>
      <td className={`px-4 py-3 ${cellY}`}>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-full transition-colors whitespace-nowrap ${
          expanded ? 'bg-[#C41B2E] text-white' : 'text-[#C41B2E]'
        }`}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
          {group.variants.length} producto{group.variants.length !== 1 ? 's' : ''}
        </span>
      </td>
      <td className={`px-4 py-3 hidden md:table-cell overflow-hidden ${cellY}`}>
        <span className="text-xs text-[#1A1613] bg-[#FAF8F4] px-2 py-0.5 rounded-md inline-block max-w-full truncate align-bottom">{displayCategoria}</span>
      </td>
      <td className={`px-4 py-3 ${cellY}`}>
        <FamilyAvailabilityBadge variants={group.variants} />
      </td>
      <td className={`px-4 py-3 hidden sm:table-cell ${cellY}`}>
        <span className="text-sm font-medium text-[#1A1613] tabular-nums whitespace-nowrap">
          {priceLabel ?? <span className="text-[#C0B5A8]">—</span>}
        </span>
      </td>
      <td className={`px-4 py-3 hidden lg:table-cell ${cellY}`}>
        <Switch
          checked={allVisible}
          onClick={e => e.stopPropagation()}
          onCheckedChange={() => onToggleVisible()}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-[#D8D0C6]"
          title={allVisible ? 'Ocultar todas las variantes' : 'Mostrar todas las variantes'}
        />
      </td>
      <td className={`px-4 py-3 ${cellY} ${expanded ? 'border-r-2 border-[#C41B2E]/60' : ''}`}>
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={e => { e.stopPropagation(); onAddChild() }}
            className="text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1]"
            title="Agregar producto hijo huérfano"
            data-tour="tour-prod-add-child"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button asChild variant="ghost" size="iconSm" className="text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1]">
            <Link
              to={`/admin/familias/${group.familiaId}`}
              onClick={e => e.stopPropagation()}
              title="Editar familia"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="text-[#9E9080] hover:text-red-500 hover:bg-red-50"
            title="Eliminar familia"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

function ProductCardMobile({
  p, nested, onNavigate, onDelete,
}: {
  p: Producto
  nested?: boolean
  onNavigate: (id: string) => void
  onDelete: (p: Producto) => void
}) {
  return (
    <div className={`relative ${nested ? 'bg-[#FFF8F5]' : ''}`}>
      {nested && <span className="absolute left-4 top-3 bottom-3 w-[3px] rounded-full bg-[#C41B2E]/40" />}
      <div
        onClick={() => onNavigate(p.id)}
        className={`flex gap-3 p-3.5 pb-2.5 active:bg-[#F4F0E8] transition-colors cursor-pointer ${nested ? 'pl-8' : ''}`}
      >
        <div className="w-11 h-11 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#EBE5DC]">
          {p.cloudinary_url
            ? <img src={p.cloudinary_url} alt={p.nombre} width={44} height={44} loading="lazy" className="w-full h-full object-cover" />
            : <Package className="w-4.5 h-4.5 text-[#C0B5A8]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1613] text-sm truncate">{p.nombre}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9E9080] mt-0.5 flex-wrap">
            <span className="font-mono bg-[#F4F0E8] px-1.5 py-0.5 rounded">{p.codigo}</span>
            {p.categoria && <span className="truncate">{p.categoria}</span>}
          </div>
          <div className="mt-2">
            <StockBadge p={p} />
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3.5 pb-3 ${nested ? 'pl-8' : ''}`}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onNavigate(p.id) }}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold text-[#6B6159] bg-[#F4F0E8] hover:bg-[#EBE5DC] active:scale-[0.97] transition-all cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(p) }}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.97] transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </div>
  )
}

function FamilyCardMobile({
  group, family, expanded, onToggle, onAddChild, onDelete, onNavigate, onDeleteProduct,
}: {
  group: FamilyGroup
  family: ProductFamily | undefined
  expanded: boolean
  onToggle: () => void
  onAddChild: () => void
  onDelete: () => void
  onNavigate: (id: string) => void
  onDeleteProduct: (p: Producto) => void
}) {
  const rep = group.variants[0]
  const displayNombre = family?.nombre ?? rep.nombre
  const displayCategoria = family?.categoria ?? rep.categoria
  const displayImagen = family?.cloudinary_url ?? rep.cloudinary_url

  return (
    <div className={expanded ? 'bg-[#FFF8F5]' : ''}>
      <div onClick={onToggle} className="flex gap-3 p-3.5 active:bg-[#F4F0E8] transition-colors cursor-pointer">
        <div className={`w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border transition-colors ${
          expanded ? 'bg-[#FFD1C0] border-[#F0A088]' : 'bg-[#F4F0E8] border-[#EBE5DC]'
        }`}>
          {displayImagen
            ? <img src={displayImagen} alt={displayNombre} width={44} height={44} loading="lazy" className="w-full h-full object-cover" />
            : <Package className="w-4.5 h-4.5 text-[#C0B5A8]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[#1A1613] text-sm truncate">{displayNombre}</p>
              {displayCategoria && <p className="text-[11px] text-[#9E9080] truncate mt-0.5">{displayCategoria}</p>}
            </div>
            <ChevronRight className={`w-4 h-4 text-[#C41B2E] flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C41B2E]">
              <Layers className="w-3 h-3 flex-shrink-0" />
              {group.variants.length} variante{group.variants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2">
            <FamilyAvailabilityBadge variants={group.variants} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3.5 pb-3 pl-[3.75rem]">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onAddChild() }}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6159] bg-[#F4F0E8] hover:bg-[#EBE5DC] active:scale-[0.97] transition-all cursor-pointer"
          title="Agregar producto hijo huérfano"
          data-tour="tour-prod-add-child"
        >
          <Plus className="w-4 h-4" />
        </button>
        <Link
          to={`/admin/familias/${group.familiaId}`}
          onClick={e => e.stopPropagation()}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6159] bg-[#F4F0E8] hover:bg-[#EBE5DC] active:scale-[0.97] transition-all"
          title="Editar familia"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.97] transition-all cursor-pointer"
          title="Eliminar familia"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && group.variants.map(v => (
        <ProductCardMobile
          key={v.id}
          p={v}
          nested
          onNavigate={onNavigate}
          onDelete={onDeleteProduct}
        />
      ))}
    </div>
  )
}

export function Products() {
  const [allProductos, setAllProductos] = useState<Producto[]>([])
  const [families, setFamilies]         = useState<ProductFamily[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [fromCache, setFromCache]       = useState(false)
  const [cacheAge, setCacheAge]         = useState<number | null>(null)
  const [search, setSearch]             = useState('')
  const [categoria, setCategoria]       = useState('')
  const [modo, setModo]                 = useState<'all' | 'en_stock' | 'por_encargo'>('all')
  const [tab, setTab]                   = useState<'todos' | 'unicos' | 'variantes' | 'hijos'>('todos')
  const [orden, setOrden]               = useState<'fecha' | 'nombre' | 'precio'>('fecha')
  const [displayCount, setDisplayCount] = useState(CHUNK)
  const [expandedKey, setExpandedKey]   = useState<string | null>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [createFamilyOpen, setCreateFamilyOpen] = useState(false)
  const [pickerFamily, setPickerFamily] = useState<ProductFamily | null>(null)
  const [deletingFamily, setDeletingFamily] = useState<FamilyGroup | null>(null)
  const sentinelRef                     = useRef<HTMLDivElement>(null)
  const navigate                        = useNavigate()

  const load = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    const [result, { data: fams }] = await Promise.all([getProductos(force), listFamilies()])
    if (result.error) {
      setError(result.error)
      toast.error('Error al cargar productos: ' + result.error)
    }
    setAllProductos(result.data)
    setFamilies(fams)
    setFromCache(result.fromCache)
    setCacheAge(getCacheAge())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let list = allProductos
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q)
      )
    }
    if (categoria) list = list.filter(p => p.categoria === categoria)
    if (modo !== 'all') list = list.filter(p => disponibilidadDeStock(p.stock) === modo)
    return list
  }, [allProductos, search, categoria, modo])

  const visibleProductos = useMemo(
    () => filtered.filter(p => p.familia_id !== SIN_ASIGNAR_ID),
    [filtered],
  )
  const familyGroups = useMemo(() => groupProductosByFamily(visibleProductos), [visibleProductos])

  const isCarpetaGroup = useCallback((f: FamilyGroup) => (
    f.variants.length > 1 || families.find(fam => fam.id === f.familiaId)?.es_carpeta === true
  ), [families])

  const unicosCount    = useMemo(() => familyGroups.filter(f => !isCarpetaGroup(f)).length, [familyGroups, isCarpetaGroup])
  const variantesCount = useMemo(() => familyGroups.filter(f => isCarpetaGroup(f)).length, [familyGroups, isCarpetaGroup])

  // "Hijos" = solo huérfanos sin asignar, uno por fila.
  const filteredOrphans = useMemo(
    () => filtered.filter(p => p.familia_id === SIN_ASIGNAR_ID),
    [filtered],
  )
  const hijosGroups = useMemo(
    () => filteredOrphans.map(p => ({ key: p.id, familiaId: p.familia_id, variants: [p] }) as FamilyGroup),
    [filteredOrphans],
  )
  const hijosCount = hijosGroups.length

  const familiesByTab = useMemo(() => {
    if (tab === 'unicos') return familyGroups.filter(f => !isCarpetaGroup(f))
    if (tab === 'variantes') return familyGroups.filter(f => isCarpetaGroup(f))
    if (tab === 'hijos') return hijosGroups
    return familyGroups
  }, [familyGroups, hijosGroups, tab])

  const unassignedChildren = useMemo(() => listUnassignedChildren(allProductos), [allProductos])
  const emptyFamilies      = useMemo(() => listEmptyFamilies(families, allProductos), [families, allProductos])

  const familyById = useMemo(() => new Map(families.map(f => [f.id, f])), [families])
  // Nombre a mostrar del grupo: el de la familia (que agrupa), no el de un
  // hijo cualquiera — cada hijo conserva su propio nombre.
  const groupDisplayName = useCallback(
    (f: FamilyGroup) => f.variants.length === 1
      ? f.variants[0].nombre
      : familyById.get(f.familiaId)?.nombre ?? f.variants[0].nombre,
    [familyById],
  )

  const sortedFamilies = useMemo(() => {
    const list = [...familiesByTab]
    if (orden === 'nombre') {
      list.sort((a, b) => groupDisplayName(a).localeCompare(groupDisplayName(b), 'es'))
    } else if (orden === 'precio') {
      list.sort((a, b) => (b.variants[0].precio_usd ?? -1) - (a.variants[0].precio_usd ?? -1))
    } else {
      list.sort((a, b) => b.variants[0].created_at.localeCompare(a.variants[0].created_at))
    }
    return list
  }, [familiesByTab, orden, groupDisplayName])

  useEffect(() => { setDisplayCount(CHUNK) }, [search, categoria, modo, tab, orden])

  const visibleFamilies = sortedFamilies.slice(0, displayCount)
  const hasMore         = displayCount < sortedFamilies.length
  const totalCount      = sortedFamilies.reduce((n, f) => n + f.variants.length, 0)
  const visibleCount    = visibleFamilies.reduce((n, f) => n + f.variants.length, 0)

  const hasActiveFilters = !!(search.trim() || categoria || modo !== 'all' || orden !== 'fecha')
  const mobileActiveCount = (categoria ? 1 : 0) + (modo !== 'all' ? 1 : 0) + (orden !== 'fecha' ? 1 : 0) + (tab !== 'todos' ? 1 : 0)

  const clearFilters = () => {
    setSearch('')
    setCategoria('')
    setModo('all')
    setOrden('fecha')
  }

  const toggleExpanded = (key: string) => {
    setExpandedKey(prev => (prev === key ? null : key))
  }

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    if (!hasMore) return
    if (loading) return

    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          setTimeout(() => {
            setDisplayCount(p => p + CHUNK)
            setLoadingMore(false)
          }, 200)
        }
      },
      { rootMargin: '300px' },
    )

    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loading])

  // Las mutaciones actualizan el estado local directamente — no se vuelve a
  // pedir toda la lista de productos a Supabase por cada acción. El cache
  // compartido sí se invalida, para que otras vistas (catálogo público) no
  // sirvan datos viejos la próxima vez que lo pidan.
  const handleDelete = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) { toast.error('Error al eliminar: ' + error.message); return }
    setAllProductos(prev => prev.filter(x => x.id !== p.id))
    invalidateProductosCache()
    toast.success('Producto eliminado')
  }

  const handleToggleDisponible = async (p: Producto) => {
    const { error } = await supabase
      .from('products')
      .update({ disponible: !p.disponible })
      .eq('id', p.id)
    if (error) { toast.error('Error al actualizar: ' + error.message); return }
    setAllProductos(prev => prev.map(x => x.id === p.id ? { ...x, disponible: !p.disponible } : x))
    invalidateProductosCache()
    toast.success(`Producto ${!p.disponible ? 'activado' : 'desactivado'}`)
  }

  const handleToggleFamilyVisible = async (group: FamilyGroup) => {
    const next = !group.variants.every(v => v.disponible)
    const ids = new Set(group.variants.map(v => v.id))
    const { error } = await supabase.from('products').update({ disponible: next }).in('id', [...ids])
    if (error) { toast.error('Error al actualizar: ' + error.message); return }
    setAllProductos(prev => prev.map(x => ids.has(x.id) ? { ...x, disponible: next } : x))
    invalidateProductosCache()
    toast.success(`${ids.size} variante${ids.size !== 1 ? 's' : ''} ${next ? 'activada' : 'desactivada'}${ids.size !== 1 ? 's' : ''}`)
  }

  const handleNavigate = (id: string) => navigate(`/admin/productos/${id}`)

  const handleCreateFamily = async (nombre: string) => {
    const { data, error } = await createEmptyFamily(nombre)
    if (error || !data) { toast.error('Error al crear la familia: ' + error); return }
    setFamilies(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    toast.success('Familia creada — agregale productos hijo cuando quieras')
    setCreateFamilyOpen(false)
  }

  const handleDeleteFamilyKeep = async () => {
    if (!deletingFamily) return
    const { error } = await deleteFamilyKeepProducts(deletingFamily.familiaId)
    if (error) { toast.error('Error al eliminar la familia: ' + error); return }
    const ids = new Set(deletingFamily.variants.map(v => v.id))
    setAllProductos(prev => prev.map(x => ids.has(x.id) ? { ...x, familia_id: SIN_ASIGNAR_ID } : x))
    setFamilies(prev => prev.filter(f => f.id !== deletingFamily.familiaId))
    invalidateProductosCache()
    toast.success('Familia eliminada — los productos quedaron como hijos huérfanos')
    setDeletingFamily(null)
  }

  const handleDeleteFamilyCascade = async () => {
    if (!deletingFamily) return
    const { error } = await deleteFamilyWithProducts(deletingFamily.familiaId)
    if (error) { toast.error('Error al eliminar la familia: ' + error); return }
    const ids = new Set(deletingFamily.variants.map(v => v.id))
    setAllProductos(prev => prev.filter(x => !ids.has(x.id)))
    setFamilies(prev => prev.filter(f => f.id !== deletingFamily.familiaId))
    invalidateProductosCache()
    toast.success('Familia y productos vinculados eliminados')
    setDeletingFamily(null)
  }

  const handleDeleteEmptyFamily = async (fam: ProductFamily) => {
    if (!confirm(`¿Eliminar la familia pendiente "${fam.nombre}"? No tiene productos vinculados.`)) return
    const { error } = await deleteFamily(fam.id)
    if (error) { toast.error('Error al eliminar la familia: ' + error); return }
    setFamilies(prev => prev.filter(f => f.id !== fam.id))
    toast.success('Familia pendiente eliminada')
  }

  const handleAddChildren = async (productIds: string[], categoriaBatch: string) => {
    if (!pickerFamily) return
    const { error } = await addChildrenToFamily(pickerFamily, productIds, categoriaBatch)
    if (error) { toast.error('Error al agregar productos: ' + error); return }
    const ids = new Set(productIds)
    setAllProductos(prev => prev.map(x => ids.has(x.id) ? { ...x, familia_id: pickerFamily.id } : x))
    if (!pickerFamily.categoria) {
      setFamilies(prev => prev.map(f => f.id === pickerFamily.id ? { ...f, categoria: categoriaBatch } : f))
    }
    invalidateProductosCache()
    toast.success(`${productIds.length} producto${productIds.length !== 1 ? 's' : ''} agregado${productIds.length !== 1 ? 's' : ''} a «${pickerFamily.nombre}»`)
    setPickerFamily(null)
  }

  const stockOk = allProductos.filter(p => p.stock > 0).length
  const stockBajo = allProductos.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length
  const porEncargo = allProductos.filter(p => p.stock === 0).length

  return (
    <>
      <style>{`
        @keyframes loadPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.8; }
        }
        @keyframes loadRing {
          0% { transform: rotate(0deg); opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0; }
        }
        @keyframes loadDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight">Productos</h1>
          <p className="text-sm text-[#9E9080] mt-0.5">
            {totalCount} producto{totalCount !== 1 ? 's' : ''}
            {(search || categoria || modo !== 'all') && (
              <span className="text-[#C0B5A8]"> filtrados</span>
            )}
            {fromCache && cacheAge !== null && (
              <span className="inline-flex items-center gap-1 ml-2 text-[#C0B5A8]">
                <Clock className="w-3 h-3" /> caché · {cacheAge} min
              </span>
            )}
          </p>
        </div>
        <div data-tour="tour-prod-actions-desktop" className="hidden md:flex md:items-center gap-2">
          <Button
            variant="brandOutline"
            onClick={() => setCreateFamilyOpen(true)}
            className="px-4 py-2.5 h-auto rounded-xl"
          >
            <FolderPlus className="w-4 h-4 text-[#C41B2E]" />
            Crear familia
          </Button>
          <Button
            variant="brand"
            onClick={() => navigate('/admin/productos/nuevo')}
            className="px-5 py-2.5 h-auto rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Agregar producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div data-tour="tour-prod-stats" className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        <div className="sm:flex-1 sm:basis-[150px] sm:min-w-[150px] bg-white rounded-xl border border-[#EBE5DC] p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 shadow-sm">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1A1613] to-[#2A2623] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Package className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-[#1A1613] leading-none tabular-nums">{allProductos.length}</p>
            <p className="text-[10px] sm:text-[11px] font-medium text-[#9E9080] uppercase tracking-wider mt-1 truncate">Total productos</p>
          </div>
        </div>
        {[
          { label: 'En stock', count: stockOk, icon: ShoppingCart, tint: 'from-emerald-600 to-emerald-500', dot: 'bg-emerald-500' },
          { label: 'Stock bajo', count: stockBajo, icon: AlertTriangle, tint: 'from-orange-500 to-amber-400', dot: 'bg-amber-500' },
          { label: 'Por encargo', count: porEncargo, icon: TrendingDown, tint: 'from-amber-500 to-amber-400', dot: 'bg-amber-400' },
        ].filter(s => s.count > 0).map(s => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="sm:flex-1 sm:basis-[150px] sm:min-w-[150px] bg-white rounded-xl border border-[#EBE5DC] p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 shadow-sm"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg ${s.tint}`}>
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-[#1A1613] leading-none tabular-nums">{s.count}</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-[#9E9080] uppercase tracking-wider mt-1 flex items-center gap-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: acciones — debajo de las estadísticas */}
      <div data-tour="tour-prod-actions-mobile" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:hidden">
        <Button
          variant="brandOutline"
          onClick={() => setCreateFamilyOpen(true)}
          className="w-full sm:w-auto justify-center px-4 py-2.5 h-auto rounded-xl"
        >
          <FolderPlus className="w-4 h-4 text-[#C41B2E]" />
          Crear familia
        </Button>
        <Button
          variant="brand"
          onClick={() => navigate('/admin/productos/nuevo')}
          className="w-full sm:w-auto justify-center px-5 py-2.5 h-auto rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Agregar producto
        </Button>
      </div>

      {/* Mobile: búsqueda + botón de filtros (como en el catálogo público) */}
      <div data-tour="tour-prod-searchbar" className="flex md:hidden items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] z-10" />
          <Input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setCategoria('')
              setModo('all')
              setOrden('fecha')
            }}
            placeholder="Buscar por nombre o código..."
            className={`w-full pl-9 h-11 bg-white border border-[#D8D0C4] shadow-sm focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E] ${
              search ? 'border-[#C41B2E]/40' : ''
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          aria-label="Abrir filtros"
          className={`flex items-center gap-2 px-4 h-11 rounded-xl text-[13px] font-semibold border transition-all duration-150 cursor-pointer flex-shrink-0 ${
            mobileActiveCount > 0
              ? 'bg-[#C41B2E] text-white border-[#C41B2E] shadow-sm'
              : 'bg-white text-[#1A1613] border-[#EBE5DC] shadow-sm'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {mobileActiveCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white/40">
              {mobileActiveCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs: Todos / Únicos / Familias / Hijos — desktop */}
      <div data-tour="tour-prod-tabs" className="hidden md:flex md:flex-wrap md:items-center md:justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={v => setTab(v as typeof tab)}
          className="w-fit"
        >
          <TabsList className="bg-white border border-[#EBE5DC] shadow-sm h-auto p-1 rounded-xl gap-1 w-max">
            {([
              { key: 'todos', label: 'Todos', count: visibleProductos.length },
              { key: 'unicos', label: 'Únicos', count: unicosCount },
              { key: 'variantes', label: 'Familias', count: variantesCount },
              { key: 'hijos', label: 'Sin asignar', count: hijosCount },
            ] as const).map(t => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="group relative rounded-lg px-3 sm:px-4 py-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1] data-[state=active]:text-white data-[state=active]:hover:bg-transparent data-[state=active]:hover:text-white transition-colors whitespace-nowrap"
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="productos-tab-pill"
                    className="absolute inset-0 rounded-lg bg-[#C41B2E] shadow-[0_2px_8px_rgba(196,27,46,0.35)]"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {t.label}
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F0E8] text-[#9E9080] group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white">
                    {t.count}
                  </span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-9 px-4 rounded-xl gap-1.5 text-[#C41B2E] hover:bg-[#FFF0F1] hover:text-[#C41B2E] font-medium"
          >
            <X className="w-4 h-4" />
            Eliminar filtros
          </Button>
        )}
      </div>

      {/* Familias pendientes (vacías, esperando su primer producto hijo) */}
      {emptyFamilies.length > 0 && (
        <div className="bg-[#FFF8F5] border border-[#F5C6BA] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#C41B2E] uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              Familias pendientes — sin productos todavía
            </p>
            {unassignedChildren.length > 0 && (
              <span className="text-xs text-[#9E9080]">
                {unassignedChildren.length} producto{unassignedChildren.length !== 1 ? 's' : ''} hijo sin asignar
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {emptyFamilies.map(fam => (
              <div
                key={fam.id}
                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-lg border border-[#EBE5DC] bg-white hover:border-[#C41B2E]/40 transition-colors"
              >
                <Button
                  variant="ghost"
                  onClick={() => setPickerFamily(fam)}
                  className="px-2.5 py-1.5 h-auto rounded-md font-medium hover:bg-[#FFF0F1]"
                >
                  <Layers className="w-3.5 h-3.5 text-[#C41B2E]" />
                  {fam.nombre}
                  <span className="text-[11px] text-[#9E9080]">· agregar hijo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => handleDeleteEmptyFamily(fam)}
                  className="text-[#9E9080] hover:text-red-500 hover:bg-red-50"
                  title="Eliminar familia pendiente"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-red-500 to-rose-400" />
          <div className="p-4">
            <p className="text-sm font-semibold text-red-700">Error al cargar productos</p>
            <p className="text-xs text-red-500 mt-0.5 font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Filters — desktop */}
      <div className={`hidden md:flex bg-white rounded-xl border p-4 flex-wrap gap-3 items-center shadow-sm transition-colors ${
        hasActiveFilters
          ? 'border-[#C41B2E]/50 ring-2 ring-[#C41B2E]/10'
          : 'border-[#EBE5DC]'
      }`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] z-10" />
          <Input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setCategoria('')
              setModo('all')
              setOrden('fecha')
            }}
            placeholder="Buscar por nombre o código..."
            className={`w-full pl-9 h-10 border-[#EBE5DC] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E] ${
              search ? 'border-[#C41B2E]/40' : ''
            }`}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8] pointer-events-none z-10" />
          <Select value={categoria || 'all'} onValueChange={v => setCategoria(v === 'all' ? '' : v)}>
            <SelectTrigger className={`pl-8 h-10 border-[#EBE5DC] focus:ring-2 focus:ring-[#C41B2E]/10 focus:border-[#C41B2E] w-[200px] ${
              categoria ? 'border-[#C41B2E]/40 text-[#C41B2E]' : ''
            }`}>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Todas las categorías</SelectItem>
              {CATEGORIAS.map(c => {
                const Icon = CATEGORIA_ICONS[c]
                return (
                  <SelectItem key={c} value={c} className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 opacity-70" />
                      {c}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8] pointer-events-none z-10" />
          <Select value={orden} onValueChange={v => setOrden(v as typeof orden)}>
            <SelectTrigger className={`pl-8 h-10 border-[#EBE5DC] focus:ring-2 focus:ring-[#C41B2E]/10 focus:border-[#C41B2E] w-[200px] ${
              orden !== 'fecha' ? 'border-[#C41B2E]/40 text-[#C41B2E]' : ''
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Por fecha de creación</SelectItem>
              <SelectItem value="nombre" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Por nombre</SelectItem>
              <SelectItem value="precio" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Por precio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8] pointer-events-none z-10" />
          <Select value={modo} onValueChange={v => setModo(v as typeof modo)}>
            <SelectTrigger className={`pl-8 h-10 border-[#EBE5DC] focus:ring-2 focus:ring-[#C41B2E]/10 focus:border-[#C41B2E] w-[180px] ${
              modo !== 'all' ? 'border-[#C41B2E]/40 text-[#C41B2E]' : ''
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Stock: Todos</SelectItem>
              <SelectItem value="en_stock" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Stock: En stock</SelectItem>
              <SelectItem value="por_encargo" className="focus:bg-[#FFF0F1] focus:text-[#C41B2E]">Stock: Por encargo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros — mobile (sheet inferior) */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 py-3 border-b border-[#EBE5DC] flex-shrink-0">
            <SheetTitle className="text-[13px] font-bold text-[#1A1613]">Filtros</SheetTitle>
            <SheetDescription className="sr-only">Filtrá y ordená la lista de productos</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A8E82] mb-3">Ver</p>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: 'todos', label: 'Todos', count: visibleProductos.length },
                  { key: 'unicos', label: 'Únicos', count: unicosCount },
                  { key: 'variantes', label: 'Familias', count: variantesCount },
                  { key: 'hijos', label: 'Sin asignar', count: hijosCount },
                ] as const).map(t => (
                  <label
                    key={t.key}
                    className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                      tab === t.key ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mobile-tab"
                      checked={tab === t.key}
                      onChange={() => setTab(t.key)}
                      className="w-4 h-4 accent-[#C41B2E]"
                    />
                    <span className={`flex-1 text-[13px] font-medium ${tab === t.key ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>
                      {t.label}
                    </span>
                    <span className="text-[11px] text-[#9E9080]">({t.count})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#EBE5DC] mx-4 my-2" />

            <div className="px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A8E82] mb-3">Categoría</p>
              <div className="flex flex-col gap-0.5">
                <label className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                  categoria === '' ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'
                }`}>
                  <input
                    type="radio"
                    name="mobile-categoria"
                    checked={categoria === ''}
                    onChange={() => setCategoria('')}
                    className="w-4 h-4 accent-[#C41B2E]"
                  />
                  <span className={`flex-1 text-[13px] font-medium ${categoria === '' ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>
                    Todas las categorías
                  </span>
                </label>
                {CATEGORIAS.map(c => {
                  const Icon = CATEGORIA_ICONS[c]
                  const active = categoria === c
                  return (
                    <label key={c} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                      <input
                        type="radio"
                        name="mobile-categoria"
                        checked={active}
                        onChange={() => setCategoria(c)}
                        className="w-4 h-4 accent-[#C41B2E]"
                      />
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C41B2E]' : 'text-[#9A8E82]'}`} />
                      <span className={`flex-1 text-[13px] font-medium ${active ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{c}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-[#EBE5DC] mx-4 my-2" />

            <div className="px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A8E82] mb-3">Ordenar por</p>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: 'fecha', label: 'Fecha de creación' },
                  { key: 'nombre', label: 'Nombre' },
                  { key: 'precio', label: 'Precio' },
                ] as const).map(o => (
                  <label key={o.key} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${orden === o.key ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                    <input
                      type="radio"
                      name="mobile-orden"
                      checked={orden === o.key}
                      onChange={() => setOrden(o.key)}
                      className="w-4 h-4 accent-[#C41B2E]"
                    />
                    <span className={`flex-1 text-[13px] font-medium ${orden === o.key ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#EBE5DC] mx-4 my-2" />

            <div className="px-4 pb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A8E82] mb-3">Stock</p>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: 'all', label: 'Todos' },
                  { key: 'en_stock', label: 'En stock' },
                  { key: 'por_encargo', label: 'Por encargo' },
                ] as const).map(m => (
                  <label key={m.key} className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${modo === m.key ? 'bg-[#FFF0F1]' : 'hover:bg-[#F5F0EA]'}`}>
                    <input
                      type="radio"
                      name="mobile-modo"
                      checked={modo === m.key}
                      onChange={() => setModo(m.key)}
                      className="w-4 h-4 accent-[#C41B2E]"
                    />
                    <span className={`flex-1 text-[13px] font-medium ${modo === m.key ? 'text-[#C41B2E]' : 'text-[#3A3530]'}`}>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 py-4 border-t border-[#EBE5DC] flex-row gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#C41B2E] bg-[rgba(196,27,46,0.06)] hover:bg-[rgba(196,27,46,0.1)] border border-[rgba(196,27,46,0.2)] transition-colors cursor-pointer"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex-[2] py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] transition-colors cursor-pointer shadow-sm"
            >
              Ver {totalCount} producto{totalCount !== 1 ? 's' : ''}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Table */}
      <div data-tour="tour-prod-list" className="bg-white rounded-xl border border-[#EBE5DC] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C41B2E] to-[#B51426] flex items-center justify-center shadow-lg shadow-[#C41B2E]/20 animate-[loadPulse_1.4s_ease-in-out_infinite]">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-2xl border-2 border-[#C41B2E]/20 animate-[loadRing_1.8s_linear_infinite]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite_0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#C41B2E] animate-[loadDot_1.2s_ease-in-out_infinite_0.4s]" />
              </div>
              <p className="text-sm text-[#9E9080] font-medium">Cargando productos...</p>
            </div>
          </div>
        ) : visibleFamilies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] flex items-center justify-center">
              <Package className="w-6 h-6 text-[#C0B5A8]" />
            </div>
            <p className="text-sm font-medium text-[#9E9080]">No se encontraron productos</p>
            <p className="text-xs text-[#C0B5A8]">Probá con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <>
          {/* Mobile / tablet chico: lista de tarjetas */}
          <div className="md:hidden divide-y divide-[#F0EAE2]">
            {visibleFamilies.map(group => {
              if (!isCarpetaGroup(group)) {
                return (
                  <ProductCardMobile
                    key={group.key}
                    p={group.variants[0]}
                    onNavigate={handleNavigate}
                    onDelete={handleDelete}
                  />
                )
              }
              const isExpanded = expandedKey === group.key
              return (
                <FamilyCardMobile
                  key={group.key}
                  group={group}
                  family={familyById.get(group.familiaId)}
                  expanded={isExpanded}
                  onToggle={() => toggleExpanded(group.key)}
                  onAddChild={() => {
                    const fam = families.find(f => f.id === group.familiaId)
                    if (fam) setPickerFamily(fam)
                  }}
                  onDelete={() => setDeletingFamily(group)}
                  onNavigate={handleNavigate}
                  onDeleteProduct={handleDelete}
                />
              )
            })}
          </div>

          {/* Tablet grande / desktop: tabla completa */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[820px]">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[28%]" />
                <col className="w-[11%]" />
                <col className="hidden md:[display:table-column] w-[13%]" />
                <col className="w-[16%]" />
                <col className="hidden sm:[display:table-column] w-[14%]" />
                <col className="hidden lg:[display:table-column] w-[6%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#EBE5DC] bg-[#FAF8F4]">
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider" />
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-[#9E9080] uppercase tracking-wider hidden lg:table-cell">Visible</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {visibleFamilies.map((group, i) => {
                  if (!isCarpetaGroup(group)) {
                    return (
                      <ProductRow
                        key={group.key}
                        p={group.variants[0]}
                        index={i}
                        onNavigate={handleNavigate}
                        onToggle={handleToggleDisponible}
                        onDelete={handleDelete}
                      />
                    )
                  }
                  const isExpanded = expandedKey === group.key
                  return (
                    <React.Fragment key={group.key}>
                      <FamilyHeaderRow
                        group={group}
                        family={familyById.get(group.familiaId)}
                        index={i}
                        expanded={isExpanded}
                        onToggle={() => toggleExpanded(group.key)}
                        onToggleVisible={() => handleToggleFamilyVisible(group)}
                        onAddChild={() => {
                          const fam = families.find(f => f.id === group.familiaId)
                          if (fam) setPickerFamily(fam)
                        }}
                        onDelete={() => setDeletingFamily(group)}
                      />
                      <AnimatePresence initial={false}>
                        {isExpanded && group.variants.map((v, vi) => (
                          <ProductRow
                            key={v.id}
                            p={v}
                            index={i}
                            nested
                            variantIndex={vi}
                            isFirst={vi === 0}
                            isLast={vi === group.variants.length - 1}
                            onNavigate={handleNavigate}
                            onToggle={handleToggleDisponible}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-5 border-t border-[#EBE5DC] bg-[#FAF8F4]">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-sm text-[#9E9080]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando más productos...
              </div>
            ) : (
              <p className="text-xs text-[#C0B5A8] font-medium">
                Mostrando {visibleCount} de {totalCount} productos — scrolleá para más
              </p>
            )}
          </div>
        )}

        {!hasMore && totalCount > CHUNK && (
          <div className="flex items-center justify-center py-4 border-t border-[#EBE5DC] bg-[#FAF8F4]">
            <p className="text-xs text-[#9E9080] font-medium">
              Mostrando todos los {totalCount} productos
            </p>
          </div>
        )}
      </div>

      <CreateFamilyModal
        open={createFamilyOpen}
        onOpenChange={setCreateFamilyOpen}
        onConfirm={handleCreateFamily}
      />

      {pickerFamily && (
        <FamilyChildPickerModal
          open={Boolean(pickerFamily)}
          onOpenChange={open => { if (!open) setPickerFamily(null) }}
          family={pickerFamily}
          unassigned={unassignedChildren}
          onConfirm={handleAddChildren}
        />
      )}

      {deletingFamily && (
        <DeleteFamilyModal
          open={Boolean(deletingFamily)}
          onOpenChange={open => { if (!open) setDeletingFamily(null) }}
          familyName={familyById.get(deletingFamily.familiaId)?.nombre ?? deletingFamily.variants[0].nombre}
          productCount={deletingFamily.variants.length}
          onKeepProducts={handleDeleteFamilyKeep}
          onDeleteProducts={handleDeleteFamilyCascade}
        />
      )}

    </div>
    </>
  )
}
