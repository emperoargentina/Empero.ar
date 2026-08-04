// src/pages/admin/views/ProductForm.tsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS } from '@/types/producto'
import type { ProductFamily } from '@/types/family'
import { getProductos, invalidateProductosCache } from '@/lib/productosCache'
import { buildFamilyOptions, generateUniqueFamilyId, updateFamily, SIN_ASIGNAR_ID, type FamilyOption } from '@/lib/adminFamilies'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Loader2, FileText, Ruler, Sparkles, Plus, X, AlertTriangle,
  Tag, Package, Weight, Zap, Boxes, Lock, MessageSquare,
} from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { CATEGORIA_ICONS } from '@/lib/categoriaIcons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

// Texto inicial editable del comentario "a medida" — reemplaza las specs
// técnicas tanto acá como en el modal público mientras el toggle esté activo.
// Soporta **negrita** estilo markdown — se renderiza en el modal público.
const DEFAULT_COMENTARIO_MEDIDA = `**Compras individuales:** disponibles ÚNICAMENTE en los productos con stock actual.

**Pedidos a medida:** requieren la compra de VARIAS UNIDADES, ya que se fabrican e importan a pedido.

💬 Escribinos por WhatsApp para consultar el stock disponible o asesorarte.`

const schema = z.object({
  // Variante
  codigo:                 z.string().min(1, 'Requerido'),
  etiqueta:               z.string().nullable().optional(),
  precio_usd:             z.coerce.number().nullable().optional(),
  mostrar_precio:         z.boolean(),
  stock:                  z.coerce.number().int().min(0),
  disponible:             z.boolean(),
  modo_disponibilidad:    z.enum(['en_stock', 'por_encargo']),
  peso_kg:                z.coerce.number().nullable().optional(),
  volumen_m3:             z.coerce.number().nullable().optional(),
  capacidad:              z.string().nullable().optional(),
  dimensiones_canasto_mm: z.string().nullable().optional(),
  dim_ancho:              z.coerce.number().nullable().optional(),
  dim_prof:               z.coerce.number().nullable().optional(),
  dim_alto:               z.coerce.number().nullable().optional(),
  dim_alto_min:           z.coerce.number().nullable().optional(),
  dim_alto_max:           z.coerce.number().nullable().optional(),
  potencia_kw:            z.coerce.number().nullable().optional(),
  consumo_gas_m3h:        z.coerce.number().nullable().optional(),
  rejilla_mm:             z.string().nullable().optional(),
  accesorios:             z.array(z.string()),
  aclaracion:             z.string().nullable().optional(),
  venta_a_medida:         z.boolean(),
  comentario_medida:      z.string().nullable().optional(),
  // Nombre/categoría/imagen del producto — si es un producto hijo se guardan
  // directo en la fila (sin familia todavía); si no, arman/actualizan su
  // familia personal de 1 solo producto ("único"). No aplica si el producto
  // ya pertenece a una familia real: ahí se editan desde "Editar familia".
  nombre:                 z.string().optional(),
  categoria:              z.string().optional(),
  cloudinary_url:         z.string().nullable().optional(),
  cloudinary_image_id:    z.string().nullable().optional(),
  caracteristicas:        z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

const EMPTY_DEFAULTS: FormValues = {
  codigo: '', etiqueta: '', precio_usd: undefined, mostrar_precio: false, stock: 0, disponible: true,
  modo_disponibilidad: 'en_stock',
  peso_kg: undefined, volumen_m3: undefined, capacidad: '', dimensiones_canasto_mm: '',
  dim_ancho: undefined, dim_prof: undefined, dim_alto: undefined, dim_alto_min: undefined, dim_alto_max: undefined,
  potencia_kw: undefined, consumo_gas_m3h: undefined, rejilla_mm: '',
  accesorios: [],
  aclaracion: '',
  venta_a_medida: false, comentario_medida: '',
  nombre: '', categoria: '', cloudinary_url: '', cloudinary_image_id: '',
  caracteristicas: [],
}

function toForm(p: Producto): FormValues {
  return {
    ...EMPTY_DEFAULTS,
    codigo:                 p.codigo,
    etiqueta:               p.etiqueta ?? '',
    precio_usd:             p.precio_usd ?? undefined,
    mostrar_precio:         p.mostrar_precio,
    stock:                  p.stock,
    disponible:             p.disponible,
    modo_disponibilidad:    p.modo_disponibilidad,
    peso_kg:                p.peso_kg ?? undefined,
    volumen_m3:             p.volumen_m3 ?? undefined,
    capacidad:              p.capacidad ?? '',
    dimensiones_canasto_mm: p.dimensiones_canasto_mm ?? '',
    dim_ancho:              p.dimensiones_mm?.Ancho ?? undefined,
    dim_prof:               p.dimensiones_mm?.Profundidad ?? undefined,
    dim_alto:               p.dimensiones_mm?.Alto ?? undefined,
    dim_alto_min:           p.dimensiones_mm?.Alto_min ?? undefined,
    dim_alto_max:           p.dimensiones_mm?.Alto_max ?? undefined,
    potencia_kw:            p.potencia_kw ?? undefined,
    consumo_gas_m3h:        p.consumo_gas_m3h ?? undefined,
    rejilla_mm:             p.rejilla_mm ?? '',
    accesorios:             p.accesorios_incluidos ?? [],
    aclaracion:             p.aclaracion ?? '',
    venta_a_medida:         p.venta_a_medida,
    comentario_medida:      p.comentario_medida ?? '',
    nombre:                 p.nombre,
    categoria:              p.categoria,
    cloudinary_url:         p.cloudinary_url ?? '',
    cloudinary_image_id:    p.cloudinary_image_id ?? '',
    caracteristicas:        p.caracteristicas_generales ?? [],
  }
}

const nullIfEmpty = (s?: string | null) => (s && s.trim() ? s.trim() : null)

// Payload de variante — nunca incluye nombre/categoria/imagen/características:
// el trigger de Postgres los deriva siempre de product_families vía familia_id
// (salvo que familia_id sea la sentinela "sin asignar", ver onSubmit).
function fromForm(v: FormValues): Record<string, unknown> {
  return {
    codigo:                 v.codigo,
    etiqueta:               nullIfEmpty(v.etiqueta),
    precio_usd:             v.precio_usd ?? null,
    mostrar_precio:         v.mostrar_precio,
    stock:                  v.stock,
    disponible:             v.disponible,
    modo_disponibilidad:    v.stock > 0 ? 'en_stock' : 'por_encargo',
    peso_kg:                v.peso_kg ?? null,
    volumen_m3:             v.volumen_m3 ?? null,
    capacidad:              nullIfEmpty(v.capacidad),
    dimensiones_canasto_mm: nullIfEmpty(v.dimensiones_canasto_mm),
    dimensiones_mm:
      v.dim_ancho || v.dim_prof || v.dim_alto || v.dim_alto_min || v.dim_alto_max
        ? {
            Ancho: v.dim_ancho ?? undefined,
            Profundidad: v.dim_prof ?? undefined,
            Alto: v.dim_alto ?? undefined,
            Alto_min: v.dim_alto_min ?? undefined,
            Alto_max: v.dim_alto_max ?? undefined,
          }
        : null,
    potencia_kw:            v.potencia_kw ?? null,
    consumo_gas_m3h:        v.consumo_gas_m3h ?? null,
    rejilla_mm:             nullIfEmpty(v.rejilla_mm),
    accesorios_incluidos:   v.accesorios.length ? v.accesorios : null,
    aclaracion:             nullIfEmpty(v.aclaracion),
    venta_a_medida:         v.venta_a_medida,
    comentario_medida:      v.venta_a_medida ? nullIfEmpty(v.comentario_medida) : null,
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="block text-[13px] font-bold uppercase tracking-wider mb-1.5 text-[#1A1613]">{children}</Label>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9E9080]">{children}</p>
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>
}

const fieldCls = 'border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] h-10 focus-visible:ring-2 focus-visible:ring-[#C41B2E]/15 focus-visible:border-[#C41B2E]'

// Card de sección con icono de color — agrupa visualmente los campos
// relacionados y hace mucho más fácil escanear tabs largos como
// "Especificaciones" o "Características".
function SectionCard({
  icon: Icon, tint, title, description, className = '', children, dataTour,
}: {
  icon: React.ElementType
  tint: string
  title: string
  description?: string
  className?: string
  children: React.ReactNode
  dataTour?: string
}) {
  return (
    <div data-tour={dataTour} className={`rounded-xl border border-[#EBE5DC] bg-white overflow-hidden ${className}`}>
      <div className="flex items-start gap-3 px-5 py-4 border-b border-[#EBE5DC] bg-[#FCFBF9]">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tint}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1A1613]">{title}</p>
          {description && <p className="text-xs text-[#9E9080] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4 flex-1">{children}</div>
    </div>
  )
}

function ToggleRow({
  label, hint, checked, onChange, color = 'brand', disabled = false, dataTour,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
  color?: 'brand' | 'green'
  disabled?: boolean
  dataTour?: string
}) {
  return (
    <div data-tour={dataTour} className={`flex items-center justify-between gap-3 p-3 border border-[#EBE5DC] rounded-xl ${disabled ? 'bg-[#FAF8F4]' : ''}`}>
      <div className="min-w-0">
        <span className={`text-sm font-medium block truncate ${disabled ? 'text-[#9E9080]' : 'text-[#1A1613]'}`}>{label}</span>
        <p className="text-xs text-[#9E9080] mt-0.5 truncate">{hint}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={`flex-shrink-0 data-[state=unchecked]:bg-[#D8D0C6] disabled:opacity-50 disabled:cursor-not-allowed ${
          color === 'green' ? 'data-[state=checked]:bg-emerald-500' : 'data-[state=checked]:bg-[#C41B2E]'
        }`}
      />
    </div>
  )
}

function ListField({
  hint, items, onChange, placeholder, scrollable = false,
}: {
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  // Para cuando el field vive en un espacio de alto fijo (ej. la mitad de
  // una card compartida con otro campo): en vez de crecer y superponerse
  // con lo de al lado, la lista de items scrollea internamente a partir de
  // que se pasa del alto disponible.
  scrollable?: boolean
}) {
  const [draft, setDraft] = useState('')

  const addItem = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...items, value])
    setDraft('')
  }

  return (
    <div className={scrollable ? 'flex flex-col h-full min-h-0' : ''}>
      <div className="flex gap-2 flex-shrink-0">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addItem() }
          }}
          className={fieldCls}
          placeholder={placeholder}
        />
        <Button type="button" variant="brand" onClick={addItem} className="whitespace-nowrap">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>
      {hint && <Hint>{hint}</Hint>}
      {items.length > 0 && (
        <div className={`mt-3 rounded-lg border border-[#EBE5DC] ${
          // Alto de 2 filas — a partir del 3er item entra en scroll en vez de
          // seguir creciendo y pisar lo que hay debajo (ej. "Aclaración opcional").
          scrollable ? 'max-h-[99px] overflow-y-auto overflow-x-hidden flex-shrink-0' : 'overflow-hidden'
        }`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-[#1A1613] border-b border-[#EBE5DC] last:border-b-0 odd:bg-white even:bg-[#FAF8F4]/50"
            >
              <span>{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-[#C0B5A8] hover:text-red-500 hover:bg-red-50"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type Tab = 'basico' | 'especificaciones' | 'caracteristicas'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'basico',           label: 'Básico',           icon: FileText },
  { id: 'especificaciones', label: 'Especificaciones', icon: Ruler },
  { id: 'caracteristicas',  label: 'Características',  icon: Sparkles },
]

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('basico')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [familyOptions, setFamilyOptions] = useState<FamilyOption[]>([])

  // Altura del tab "Básico" — se mide para que Especificaciones y
  // Características estiren sus contenedores al mismo alto y el botón
  // "Guardar cambios" quede en el mismo lugar en los tres tabs.
  const basicoRef = useRef<HTMLDivElement>(null)
  const [tabMinHeight, setTabMinHeight] = useState<number>(0)

  useEffect(() => {
    if (tab !== 'basico') return
    const el = basicoRef.current
    if (!el) return
    const measure = () => setTabMinHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tab])

  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyPreview, setFamilyPreview] = useState<ProductFamily | null>(null)
  const [isCarpeta, setIsCarpeta] = useState(false)
  const [isChild, setIsChild] = useState(false)

  const wasPending = producto?.familia_id === SIN_ASIGNAR_ID

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: EMPTY_DEFAULTS,
  })

  useEffect(() => {
    if (!isEdit || !id) return
    setLoading(true)
    setLoadError('')
    const load = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error || !data) {
        setLoadError('Producto no encontrado')
        setLoading(false)
        return
      }
      const p = data as Producto
      setProducto(p)
      setFamilyId(p.familia_id)
      setIsChild(p.familia_id === SIN_ASIGNAR_ID)
      reset(toForm(p))

      // Se resuelve junto con el producto (no en un efecto aparte) para que
      // el blur de "pertenece a una familia" ya esté listo en el primer render.
      if (p.familia_id && p.familia_id !== SIN_ASIGNAR_ID) {
        const [{ data: fam }, { count }] = await Promise.all([
          supabase.from('product_families').select('*').eq('id', p.familia_id).single(),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('familia_id', p.familia_id),
        ])
        setFamilyPreview((fam as ProductFamily) ?? null)
        setIsCarpeta(Boolean((fam as ProductFamily | null)?.es_carpeta) || (count ?? 0) > 1)
      } else {
        setFamilyPreview(null)
        setIsCarpeta(false)
      }
      setLoading(false)
    }
    void load()
  }, [id, isEdit, reset])

  useEffect(() => {
    const loadFamilyOptions = async () => {
      const { data } = await getProductos()
      setFamilyOptions(buildFamilyOptions(data))
    }
    void loadFamilyOptions()
  }, [])

  const handleQuitarDeFamilia = async () => {
    if (!id || !familyId || !familyPreview) return
    if (!confirm(`¿Quitar este producto de "${familyPreview.nombre}"? Pasará a ser un producto hijo sin familia asignada.`)) return
    const { error } = await supabase.from('products').update({ familia_id: SIN_ASIGNAR_ID }).eq('id', id)
    if (error) { toast.error('Error al quitar de la familia: ' + error.message); return }

    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) {
      const p = data as Producto
      setProducto(p)
      setFamilyId(p.familia_id)
      setIsChild(true)
      setIsCarpeta(false)
      setFamilyPreview(null)
      reset(toForm(p))
    }
    invalidateProductosCache()
    toast.success('Producto quitado de la familia — ahora es un producto hijo sin asignar')
  }

  const onSubmit = async (values: FormValues) => {
    // Caso: producto hijo — se guarda en el pool "Sin asignar", sin familia real.
    if (isChild) {
      if (!values.nombre?.trim() || !values.categoria?.trim()) {
        toast.error('Completá nombre y categoría del producto hijo')
        setTab('basico')
        return
      }
      const previousFamiliaId = producto?.familia_id ?? null
      const payload = {
        ...fromForm(values),
        familia_id: SIN_ASIGNAR_ID,
        nombre: values.nombre.trim(),
        categoria: values.categoria,
        cloudinary_url: nullIfEmpty(values.cloudinary_url),
        cloudinary_image_id: nullIfEmpty(values.cloudinary_image_id),
        ...(isEdit ? {} : { id: crypto.randomUUID() }),
      }

      const { error } = isEdit
        ? await supabase.from('products').update(payload).eq('id', id)
        : await supabase.from('products').insert(payload)

      if (error) {
        toast.error(`Error al ${isEdit ? 'guardar' : 'crear'} el producto`)
        return
      }

      // Si se extrajo de una familia personal que quedó sin productos, se
      // borra — pero nunca una carpeta real creada a propósito (esa puede
      // quedar vacía a propósito, ver "familias pendientes").
      if (previousFamiliaId && previousFamiliaId !== SIN_ASIGNAR_ID) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('familia_id', previousFamiliaId)
        if (count === 0) {
          const { data: prevFam } = await supabase
            .from('product_families')
            .select('es_carpeta')
            .eq('id', previousFamiliaId)
            .single()
          if (!prevFam?.es_carpeta) {
            const { error: delError } = await supabase.from('product_families').delete().eq('id', previousFamiliaId)
            if (delError) toast.error('No se pudo borrar la familia anterior: ' + delError.message)
          }
        }
      }

      invalidateProductosCache()
      toast.success(isEdit ? 'Producto actualizado — sin familia asignada' : 'Producto hijo creado — asignalo desde una familia')
      navigate('/admin/productos')
      return
    }

    // Caso: producto ya asignado a una familia real — solo se editan sus
    // campos propios, nombre/categoría/imagen se manejan desde "Editar familia".
    if (isCarpeta) {
      if (!familyId) { toast.error('Falta la familia del producto'); return }
      const payload = { ...fromForm(values), familia_id: familyId }
      const { error } = await supabase.from('products').update(payload).eq('id', id)
      if (error) { toast.error('Error al guardar: ' + error.message); return }
      invalidateProductosCache()
      toast.success('Producto actualizado')
      navigate('/admin/productos')
      return
    }

    // Caso: producto único — arma o actualiza su familia personal (1:1).
    if (!values.nombre?.trim() || !values.categoria?.trim()) {
      toast.error('Completá nombre y categoría del producto')
      setTab('basico')
      return
    }

    let famId = familyId
    const mustCreateNewFamily = !isEdit || wasPending

    if (mustCreateNewFamily) {
      famId = generateUniqueFamilyId(values.nombre, familyOptions.map(f => f.familia_id))
      const { error: famError } = await supabase.from('product_families').insert({
        id: famId,
        nombre: values.nombre.trim(),
        categoria: values.categoria,
        cloudinary_url: nullIfEmpty(values.cloudinary_url),
        cloudinary_image_id: nullIfEmpty(values.cloudinary_image_id),
        caracteristicas_generales: values.caracteristicas.length ? values.caracteristicas : null,
        es_carpeta: false,
      })
      if (famError) {
        toast.error('Error al crear la familia: ' + famError.message)
        return
      }
    } else {
      const { error: famError } = await updateFamily(famId!, {
        nombre: values.nombre.trim(),
        categoria: values.categoria,
        cloudinary_url: nullIfEmpty(values.cloudinary_url),
        cloudinary_image_id: nullIfEmpty(values.cloudinary_image_id),
        caracteristicas_generales: values.caracteristicas.length ? values.caracteristicas : null,
      })
      if (famError) {
        toast.error('Error al actualizar el producto: ' + famError)
        return
      }
    }

    if (!famId) {
      toast.error('Elegí o creá una familia para el producto')
      setTab('basico')
      return
    }

    // No hay trigger en Postgres que derive nombre/categoría/imagen/
    // características desde product_families — se mandan explícitos acá,
    // igual que en el caso "producto hijo". Para un producto único son 1:1
    // con su familia personal, así que quedan siempre sincronizados entre sí.
    const payload = {
      ...fromForm(values),
      familia_id: famId,
      nombre: values.nombre.trim(),
      categoria: values.categoria,
      cloudinary_url: nullIfEmpty(values.cloudinary_url),
      cloudinary_image_id: nullIfEmpty(values.cloudinary_image_id),
      caracteristicas_generales: values.caracteristicas.length ? values.caracteristicas : null,
      ...(isEdit ? {} : { id: crypto.randomUUID() }),
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)

    if (error) {
      if (mustCreateNewFamily) {
        // Best-effort: la familia recién creada queda huérfana (sin variantes,
        // invisible en cualquier listado) si esto falla — no bloquea el toast.
        void supabase.from('product_families').delete().eq('id', famId)
      }
      toast.error(`Error al ${isEdit ? 'guardar' : 'crear'} el producto`)
      return
    }

    invalidateProductosCache()
    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
    navigate('/admin/productos')
  }

  if (isEdit && loading) {
    return (
      <div className="flex items-center gap-3 py-24 justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#C41B2E]" />
        <span className="text-sm text-[#9E9080]">Cargando producto...</span>
      </div>
    )
  }

  if (isEdit && loadError) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-600">{loadError}</div>
        <Link to="/admin/productos" className="inline-flex items-center gap-2 text-sm font-medium text-[#C41B2E]">
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Link>
      </div>
    )
  }

  const disponible = watch('disponible')
  const mostrarPrecio = watch('mostrar_precio')
  const accesorios = watch('accesorios')
  const cloudinaryUrl = watch('cloudinary_url')
  const cloudinaryImageId = watch('cloudinary_image_id')
  const caracteristicas = watch('caracteristicas')
  const stock = watch('stock')
  const disponibilidad = stock > 0 ? 'en_stock' : 'por_encargo'
  const ventaAMedida = watch('venta_a_medida')
  const comentarioMedida = watch('comentario_medida')

  // Mientras esté "a medida", el tab de specs técnicas se reemplaza por un
  // comentario editable — mismo id de tab, solo cambia label/ícono/contenido.
  const tabs = ventaAMedida
    ? TABS.map(t => t.id === 'especificaciones' ? { ...t, label: 'Comentario', icon: MessageSquare } : t)
    : TABS

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="brandOutline" size="icon" className="rounded-lg">
          <Link to="/admin/productos">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#1A1613] truncate">
            {isEdit ? (producto?.nombre ?? 'Editar producto') : 'Agregar producto'}
          </h1>
          <p className="text-xs text-[#9E9080]">
            {isEdit ? `Editando · ${producto?.codigo ?? ''}` : 'Completá los datos para crear un producto nuevo'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Tabs
            data-tour="tour-form-tabs"
            value={tab}
            onValueChange={v => setTab(v as Tab)}
            className="w-full sm:w-fit overflow-x-auto"
          >
            <TabsList className="bg-white border border-[#EBE5DC] shadow-sm h-auto p-1 rounded-lg gap-0.5 w-max">
              {tabs.map(({ id: tabId, label, icon: Icon }) => (
                <TabsTrigger
                  key={tabId}
                  value={tabId}
                  data-tour-tab={tabId}
                  className="group relative gap-1.5 rounded-md px-3 py-1.5 text-[#6B6159] hover:text-[#C41B2E] hover:bg-[#FFF0F1] data-[state=active]:text-white data-[state=active]:hover:bg-transparent data-[state=active]:hover:text-white transition-colors whitespace-nowrap"
                >
                  {tab === tabId && (
                    <motion.span
                      layoutId="productform-tab-pill"
                      className="absolute inset-0 rounded-md bg-[#C41B2E] shadow-[0_2px_8px_rgba(196,27,46,0.35)]"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isCarpeta && familyPreview && (
            <div data-tour="tour-form-family-badge" className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-1.5 rounded-lg border border-[#EBE5DC] bg-white shadow-sm">
              <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-[#F4F0E8] border border-[#EBE5DC] flex items-center justify-center">
                {familyPreview.cloudinary_url
                  ? <img src={familyPreview.cloudinary_url} alt={familyPreview.nombre} width={32} height={32} className="w-full h-full object-cover" />
                  : <Package className="w-3.5 h-3.5 text-[#C0B5A8]" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#9E9080] font-medium uppercase tracking-wider leading-none">Familia</p>
                <Link
                  to={`/admin/familias/${familyId}`}
                  className="text-sm font-semibold text-[#1A1613] hover:text-[#C41B2E] transition-colors truncate block max-w-[140px] mt-0.5"
                >
                  {familyPreview.nombre}
                </Link>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleQuitarDeFamilia}
                className="bg-red-50 text-red-600 border border-red-200 shadow-none hover:bg-red-100 flex-shrink-0 h-7 px-2.5"
              >
                <X className="w-3.5 h-3.5" /> Quitar
              </Button>
            </div>
          )}
        </div>

        {tab === 'basico' && (
          <div ref={basicoRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <SectionCard
              dataTour="tour-form-identity"
              icon={Tag}
              tint="bg-[#FFE4E6] text-[#C41B2E]"
              title="Identidad del producto"
              description={
                isCarpeta
                  ? 'Es su propia identidad — se mantiene aunque pertenezca a una familia'
                  : isChild
                    ? 'Nombre, categoría e imagen para identificarlo mientras no tiene familia'
                    : 'Nombre, categoría e imagen que va a mostrar el catálogo'
              }
              className="h-full flex flex-col"
            >
              {isEdit && wasPending && !isChild && (
                <Hint>Este producto no tenía familia — al guardar se crea una para que pase a ser "único".</Hint>
              )}
              <div className="relative">
                {isCarpeta && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl backdrop-blur-sm bg-white/55 pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-[#1A1613]/85 text-white flex items-center justify-center shadow-sm">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1613]/85 text-white text-xs font-semibold shadow-sm">
                      Desactivado — pertenece a una familia
                    </span>
                    <p className="text-xs text-[#6B6159] text-center max-w-[80%]">
                      Quitalo de la familia para poder editar su identidad manualmente.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Nombre *</FieldLabel>
                    <Input
                      {...register('nombre')}
                      disabled={isCarpeta}
                      className={`${fieldCls} disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#FAF8F4]`}
                      placeholder={isChild ? 'Para identificarlo en el selector' : 'Ej: Lavavajillas Industrial LV-500'}
                    />
                  </div>
                  <div>
                    <FieldLabel>Categoría *</FieldLabel>
                    <Controller
                      control={control}
                      name="categoria"
                      render={({ field }) => (
                        <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isCarpeta}>
                          <SelectTrigger className={`${fieldCls} disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#FAF8F4]`}>
                            <SelectValue placeholder="Seleccionar categoría..." />
                          </SelectTrigger>
                          <SelectContent>
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
                      )}
                    />
                  </div>
                </div>
                <ImageUpload
                  size="lg"
                  disabled={isCarpeta}
                  url={cloudinaryUrl || null}
                  publicId={cloudinaryImageId || null}
                  onChange={(url, publicId) => {
                    setValue('cloudinary_url', url ?? '')
                    setValue('cloudinary_image_id', publicId ?? '')
                  }}
                  className="mt-4"
                />
              </div>
              {isChild && (
                <p className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Al ser un producto hijo sin asignar, esta imagen no se muestra en el catálogo público — se va a ver recién cuando lo asignes a una familia.
                </p>
              )}
            </SectionCard>

            <SectionCard
              dataTour="tour-form-variant"
              icon={Package}
              tint="bg-slate-100 text-slate-600"
              title="Datos de la variante"
              description="Código, precio, stock y visibilidad de esta variante puntual"
              className="h-full flex flex-col"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Código *</FieldLabel>
                  <Input {...register('codigo')} className={fieldCls} placeholder="Ej: EMP.LV-500" />
                  {errors.codigo && <ErrorText>{errors.codigo.message}</ErrorText>}
                </div>
                <div>
                  <FieldLabel>Nombre de Producto hijo</FieldLabel>
                  <Input
                    {...register('etiqueta')}
                    disabled={!isChild}
                    className={`${fieldCls} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#FAF8F4]`}
                    placeholder={isChild ? 'Ej: "2 puertas — 300 Lt"' : 'Activá "Producto hijo" para editar'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Precio (USD)</FieldLabel>
                  <Input type="number" step="0.01" min="0" {...register('precio_usd')} className={fieldCls} placeholder="0.00" />
                  {errors.precio_usd && <ErrorText>{errors.precio_usd.message}</ErrorText>}
                </div>
                <div>
                  <FieldLabel>Stock actual</FieldLabel>
                  <Input type="number" min="0" {...register('stock')} className={fieldCls} placeholder="0" />
                  {errors.stock && <ErrorText>{errors.stock.message}</ErrorText>}
                </div>
              </div>
              <div>
                <FieldLabel>Disponibilidad</FieldLabel>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                  disponibilidad === 'en_stock'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    disponibilidad === 'en_stock' ? 'bg-emerald-500' : 'bg-amber-400'
                  }`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${
                      disponibilidad === 'en_stock' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {disponibilidad === 'en_stock' ? 'En stock' : 'Por encargo'}
                    </p>
                    <p className="text-xs text-[#6B6159] mt-0.5">
                      {disponibilidad === 'en_stock'
                        ? 'Se muestra como disponible en el catálogo'
                        : 'Se muestra como por encargo — sin unidades disponibles'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToggleRow
                  dataTour="tour-form-toggle-visible"
                  label="Visible en el catálogo"
                  hint={disponible ? 'Aparece en la tienda' : 'Está oculto'}
                  checked={disponible}
                  onChange={v => setValue('disponible', v)}
                  color="green"
                />
                <ToggleRow
                  dataTour="tour-form-toggle-precio"
                  label="Mostrar precio"
                  hint={mostrarPrecio ? 'Se muestra en la ficha' : 'Precio oculto'}
                  checked={mostrarPrecio}
                  onChange={v => setValue('mostrar_precio', v)}
                  color="green"
                />
                <ToggleRow
                  dataTour="tour-form-toggle-hijo"
                  label="Producto hijo"
                  hint={
                    isCarpeta
                      ? 'Para quitarlo, desvinculá la familia arriba'
                      : ventaAMedida
                        ? 'Desactivá "Venta a medida" para poder tocarlo'
                        : isChild
                          ? 'Sin familia todavía'
                          : 'Producto único'
                  }
                  checked={isCarpeta ? true : isChild}
                  onChange={setIsChild}
                  disabled={isCarpeta || ventaAMedida}
                />
                <ToggleRow
                  dataTour="tour-form-toggle-medida"
                  label="Venta a medida"
                  hint={
                    isChild
                      ? 'Desactivá "Producto hijo" para poder tocarlo'
                      : ventaAMedida
                        ? 'Se fabrica/importa a pedido'
                        : 'Producto de stock normal'
                  }
                  checked={ventaAMedida}
                  onChange={v => {
                    setValue('venta_a_medida', v)
                    if (v && !comentarioMedida?.trim()) {
                      setValue('comentario_medida', DEFAULT_COMENTARIO_MEDIDA)
                    }
                  }}
                  disabled={isChild}
                />
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'especificaciones' && ventaAMedida && (
          <div style={tabMinHeight > 0 ? { minHeight: tabMinHeight } : undefined}>
            <SectionCard
              dataTour="tour-form-comentario"
              icon={MessageSquare}
              tint="bg-violet-100 text-violet-600"
              title="Comentario"
              description="Reemplaza las especificaciones técnicas en el catálogo público mientras esté activa la venta a medida"
              className="h-full flex flex-col"
            >
              <Textarea
                {...register('comentario_medida')}
                rows={10}
                className="text-sm border-[#EBE5DC] bg-white text-[#1A1613] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/15 focus-visible:border-[#C41B2E]"
                placeholder="Escribí el comentario que va a ver el cliente..."
              />
            </SectionCard>
          </div>
        )}

        {tab === 'especificaciones' && !ventaAMedida && (
          <div
            data-tour="tour-form-specs"
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            style={tabMinHeight > 0 ? { gridAutoRows: `minmax(${tabMinHeight}px, auto)` } : undefined}
          >
            <SectionCard
              icon={Ruler}
              tint="bg-sky-100 text-sky-600"
              title="Dimensiones externas"
              description="Medidas del gabinete — dejá el alto vacío si es regulable"
              className="h-full flex flex-col"
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Ancho (mm)</FieldLabel>
                  <Input type="number" {...register('dim_ancho')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Profundidad (mm)</FieldLabel>
                  <Input type="number" {...register('dim_prof')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Alto (mm)</FieldLabel>
                  <Input type="number" {...register('dim_alto')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Alto mínimo (mm)</FieldLabel>
                  <Input type="number" {...register('dim_alto_min')} className={fieldCls} placeholder="—" />
                  <Hint>Para altura regulable</Hint>
                </div>
                <div>
                  <FieldLabel>Alto máximo (mm)</FieldLabel>
                  <Input type="number" {...register('dim_alto_max')} className={fieldCls} placeholder="—" />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Weight}
              tint="bg-amber-100 text-amber-600"
              title="Peso y capacidad"
              description="Volumen, capacidad interna y peso para logística"
              className="h-full flex flex-col"
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Peso (kg)</FieldLabel>
                  <Input type="number" step="0.01" {...register('peso_kg')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Volumen (m³)</FieldLabel>
                  <Input type="number" step="0.0001" {...register('volumen_m3')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Capacidad</FieldLabel>
                  <Input {...register('capacidad')} className={fieldCls} placeholder='Ej: "50 L" o "20 bandejas"' />
                </div>
                <div>
                  <FieldLabel>Dim. canasto (mm)</FieldLabel>
                  <Input {...register('dimensiones_canasto_mm')} className={fieldCls} placeholder="Ej: 500×500" />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Zap}
              tint="bg-violet-100 text-violet-600"
              title="Datos técnicos"
              description="Potencia, consumo y rejilla — solo si aplica al equipo"
              className="h-full flex flex-col"
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Potencia (kW)</FieldLabel>
                  <Input type="number" step="0.01" {...register('potencia_kw')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Consumo de gas (m³/h)</FieldLabel>
                  <Input type="number" step="0.01" {...register('consumo_gas_m3h')} className={fieldCls} placeholder="—" />
                </div>
                <div>
                  <FieldLabel>Rejilla (mm)</FieldLabel>
                  <Input {...register('rejilla_mm')} className={fieldCls} placeholder="Ej: 560×524" />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'caracteristicas' && (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            style={tabMinHeight > 0 ? { gridAutoRows: `minmax(${tabMinHeight}px, auto)` } : undefined}
          >
            <SectionCard
              dataTour="tour-form-caracteristicas"
              icon={Sparkles}
              tint="bg-teal-100 text-teal-600"
              title="Características generales"
              description="Bullets que se muestran en la ficha del producto"
              className="h-full flex flex-col"
            >
              {isCarpeta ? (
                <Hint>Se editan desde "Editar familia" — se comparten entre todos los productos de la carpeta.</Hint>
              ) : isChild ? (
                <Hint>Las toma de la familia recién lo asignes a una.</Hint>
              ) : (
                <ListField
                  items={caracteristicas}
                  hint="Escribí una característica y presioná Enter o Agregar"
                  onChange={items => setValue('caracteristicas', items)}
                  placeholder="Ej: Construcción en acero inoxidable"
                />
              )}
            </SectionCard>

            <SectionCard
              dataTour="tour-form-accesorios"
              icon={Boxes}
              tint="bg-indigo-100 text-indigo-600"
              title="Accesorios incluidos"
              description="Todo lo que viene de fábrica con esta variante"
              className="h-full flex flex-col"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                  <ListField
                    items={accesorios}
                    hint="Escribí un accesorio y presioná Enter o Agregar"
                    onChange={items => setValue('accesorios', items)}
                    placeholder="Ej: Cesta porta-vajilla"
                    scrollable
                  />
                </div>

                <div className="h-px bg-[#EBE5DC] my-4 flex-shrink-0" />

                <div className="flex-1 min-h-0 flex flex-col">
                  <FieldLabel>Aclaración opcional</FieldLabel>
                  <Textarea
                    {...register('aclaracion')}
                    rows={3}
                    className="flex-1 resize-none text-sm border-[#EBE5DC] bg-white text-[#1A1613] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/15 focus-visible:border-[#C41B2E]"
                    placeholder='Ej: "Este gabinete es para el Horno a Carbón PKF-40"'
                  />
                  <Hint>Para cuando el producto es específico para otro — se muestra en la ficha pública</Hint>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-[#EBE5DC] flex-wrap">
          <span className="text-xs text-[#9E9080]">* Campos obligatorios</span>
          <Button data-tour="tour-form-submit" type="submit" variant="brand" disabled={isSubmitting} className="px-6 py-2.5 h-auto rounded-xl">
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />{isEdit ? 'Guardar cambios' : 'Crear producto'}</>
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
