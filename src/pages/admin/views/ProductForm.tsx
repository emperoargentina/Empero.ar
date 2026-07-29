// src/pages/admin/views/ProductForm.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS } from '@/types/producto'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Loader2, FileText, ImageIcon, Ruler, Wrench, Plus, X,
} from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'

const schema = z.object({
  nombre:                 z.string().min(1, 'Requerido'),
  codigo:                 z.string().min(1, 'Requerido'),
  familia_id:             z.string().nullable().optional(),
  etiqueta:               z.string().nullable().optional(),
  categoria:              z.string().min(1, 'Requerido'),
  precio_usd:             z.coerce.number().nullable().optional(),
  stock:                  z.coerce.number().int().min(0),
  disponible:             z.boolean(),
  modo_disponibilidad:    z.enum(['en_stock', 'por_encargo']),
  cloudinary_url:         z.string().nullable().optional(),
  cloudinary_image_id:    z.string().nullable().optional(),
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
  caracteristicas:        z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

const EMPTY_DEFAULTS: FormValues = {
  nombre: '', codigo: '', familia_id: '', etiqueta: '', categoria: '',
  precio_usd: undefined, stock: 0, disponible: true, modo_disponibilidad: 'en_stock',
  cloudinary_url: '', cloudinary_image_id: '',
  peso_kg: undefined, volumen_m3: undefined, capacidad: '', dimensiones_canasto_mm: '',
  dim_ancho: undefined, dim_prof: undefined, dim_alto: undefined, dim_alto_min: undefined, dim_alto_max: undefined,
  potencia_kw: undefined, consumo_gas_m3h: undefined, rejilla_mm: '',
  accesorios: [], caracteristicas: [],
}

function toForm(p: Producto): FormValues {
  return {
    nombre:                 p.nombre,
    codigo:                 p.codigo,
    familia_id:             p.familia_id ?? '',
    etiqueta:               p.etiqueta ?? '',
    categoria:              p.categoria,
    precio_usd:             p.precio_usd ?? undefined,
    stock:                  p.stock,
    disponible:             p.disponible,
    modo_disponibilidad:    p.modo_disponibilidad,
    cloudinary_url:         p.cloudinary_url ?? '',
    cloudinary_image_id:    p.cloudinary_image_id ?? '',
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
    caracteristicas:        p.caracteristicas_generales ?? [],
  }
}

function fromForm(v: FormValues, id?: string): Record<string, unknown> {
  const nullIfEmpty = (s?: string | null) => (s && s.trim() ? s.trim() : null)
  return {
    ...(id ? { id } : {}),
    nombre:                 v.nombre,
    codigo:                 v.codigo,
    familia_id:             nullIfEmpty(v.familia_id),
    etiqueta:               nullIfEmpty(v.etiqueta),
    categoria:              v.categoria,
    precio_usd:             v.precio_usd ?? null,
    stock:                  v.stock,
    disponible:             v.disponible,
    modo_disponibilidad:    v.modo_disponibilidad,
    cloudinary_url:         nullIfEmpty(v.cloudinary_url),
    cloudinary_image_id:    nullIfEmpty(v.cloudinary_image_id),
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
    accesorios_incluidos:      v.accesorios.length ? v.accesorios : null,
    caracteristicas_generales: v.caracteristicas.length ? v.caracteristicas : null,
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#9E9080]">{children}</p>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9E9080]">{children}</p>
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl p-5 space-y-4 bg-white border border-[#EBE5DC] ${className}`}>{children}</div>
}

function ListField({
  label, hint, items, onChange, placeholder,
}: {
  label: string
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  const addItem = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...items, value])
    setDraft('')
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addItem() }
          }}
          className={inputCls}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>
      {hint && <Hint>{hint}</Hint>}
      {items.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#EBE5DC] overflow-hidden">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-[#1A1613] border-b border-[#EBE5DC] last:border-b-0 odd:bg-white even:bg-[#FAF8F4]/50"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-[#C0B5A8] hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[rgba(196,27,46,0.1)] transition-all placeholder:text-[#C0B5A8] bg-white'

type Tab = 'basico' | 'imagen' | 'fisico' | 'tecnico'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'basico',  label: 'Básico',  icon: FileText },
  { id: 'imagen',  label: 'Imagen',  icon: ImageIcon },
  { id: 'fisico',  label: 'Físico',  icon: Ruler },
  { id: 'tecnico', label: 'Técnico', icon: Wrench },
]

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('basico')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)

  const {
    register,
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
      } else {
        setProducto(data as Producto)
        reset(toForm(data as Producto))
      }
      setLoading(false)
    }
    void load()
  }, [id, isEdit, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = fromForm(values, isEdit ? id : undefined)

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)

    if (error) {
      toast.error(`Error al ${isEdit ? 'guardar' : 'crear'} el producto`)
      return
    }

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
  const cloudinaryUrl = watch('cloudinary_url')
  const cloudinaryImageId = watch('cloudinary_image_id')
  const accesorios = watch('accesorios')
  const caracteristicas = watch('caracteristicas')

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/productos"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#EBE5DC] text-[#6B6159] hover:bg-[#F4F0E8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#1A1613]">
            {isEdit ? (producto?.nombre ?? 'Editar producto') : 'Agregar producto'}
          </h1>
          <p className="text-xs text-[#9E9080]">
            {isEdit ? `Editando · ${producto?.codigo ?? ''}` : 'Completá los datos para crear un producto nuevo'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="inline-flex items-center gap-0.5 mb-6 p-1 rounded-lg bg-[#F4F0E8] border border-[#EBE5DC]">
          {TABS.map(({ id: tabId, label, icon: Icon }) => {
            const active = tab === tabId
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setTab(tabId)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  active ? 'bg-[#C41B2E] text-white shadow-[0_1px_6px_rgba(196,27,46,0.4)]' : 'text-[#6B6159] hover:text-[#1A1613]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            )
          })}
        </div>

        {tab === 'basico' && (
          <div className="space-y-5 min-h-[32rem]">
            <Card>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Nombre *</Label>
                  <input {...register('nombre')} className={inputCls} placeholder="Ej: Lavavajillas Industrial LV-500" />
                  {errors.nombre && <ErrorText>{errors.nombre.message}</ErrorText>}
                </div>
                <div>
                  <Label>Código *</Label>
                  <input {...register('codigo')} className={inputCls} placeholder="Ej: EMP.LV-500" />
                  {errors.codigo && <ErrorText>{errors.codigo.message}</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Etiqueta de variante</Label>
                  <input {...register('etiqueta')} className={inputCls} placeholder='Ej: "2 puertas — 300 Lt"' />
                  <Hint>Texto en el selector de variantes</Hint>
                </div>
                <div>
                  <Label>ID de familia</Label>
                  <input {...register('familia_id')} className={inputCls} placeholder="Ej: lavavajillas-capota" />
                  <Hint>Mismo ID en variantes del mismo producto</Hint>
                </div>
              </div>
              <div>
                <Label>Categoría *</Label>
                <select {...register('categoria')} className={inputCls + ' cursor-pointer'}>
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.categoria && <ErrorText>{errors.categoria.message}</ErrorText>}
              </div>
            </Card>

            <Card>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Precio (USD)</Label>
                  <input type="number" step="0.01" min="0" {...register('precio_usd')} className={inputCls} placeholder="0.00" />
                  {errors.precio_usd && <ErrorText>{errors.precio_usd.message}</ErrorText>}
                </div>
                <div>
                  <Label>Stock actual</Label>
                  <input type="number" min="0" {...register('stock')} className={inputCls} placeholder="0" />
                  {errors.stock && <ErrorText>{errors.stock.message}</ErrorText>}
                </div>
              </div>
              <div>
                <Label>Modo de disponibilidad *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['en_stock', 'por_encargo'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-3 px-4 py-3 border border-[#EBE5DC] rounded-xl cursor-pointer hover:border-[#C41B2E]/50 has-[:checked]:border-[#C41B2E] has-[:checked]:bg-[rgba(196,27,46,0.03)] transition-all">
                      <input type="radio" value={opt} {...register('modo_disponibilidad')} className="accent-[#C41B2E]" />
                      <span className="text-sm font-medium text-[#1A1613]">
                        {opt === 'en_stock' ? 'En stock' : 'Por encargo'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 p-4 border border-[#EBE5DC] rounded-xl cursor-pointer hover:border-[#D8D0C4] transition-colors">
                <input type="checkbox" {...register('disponible')} className="w-4 h-4 accent-[#C41B2E] rounded" />
                <div>
                  <span className="text-sm font-medium text-[#1A1613]">Visible en el catálogo</span>
                  <p className="text-xs text-[#9E9080] mt-0.5">
                    {disponible ? 'El producto aparece en la tienda' : 'El producto está oculto'}
                  </p>
                </div>
              </label>
            </Card>
          </div>
        )}

        {tab === 'imagen' && (
          <Card className="min-h-[32rem]">
            <ImageUpload
              url={cloudinaryUrl || null}
              publicId={cloudinaryImageId || null}
              onChange={(url, publicId) => {
                setValue('cloudinary_url', url ?? '')
                setValue('cloudinary_image_id', publicId ?? '')
              }}
            />
            <div>
              <Label>URL de imagen (manual)</Label>
              <input {...register('cloudinary_url')} className={inputCls} placeholder="https://res.cloudinary.com/..." />
              <Hint>Se completa sola al subir una imagen, o pegá una URL existente</Hint>
            </div>
          </Card>
        )}

        {tab === 'fisico' && (
          <div className="space-y-5 min-h-[32rem]">
            <p className="text-xs text-[#9E9080] italic">Todos los campos son opcionales.</p>
            <fieldset className="border border-[#EBE5DC] rounded-xl p-5 space-y-4 bg-[#FAF8F4]/50">
              <legend className="px-3 text-xs font-semibold text-[#6B6159] uppercase tracking-wider bg-white rounded-md py-1.5 border border-[#EBE5DC]">
                Dimensiones externas
              </legend>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ancho (mm)</Label>
                  <input type="number" {...register('dim_ancho')} className={inputCls} placeholder="—" />
                </div>
                <div>
                  <Label>Profundidad (mm)</Label>
                  <input type="number" {...register('dim_prof')} className={inputCls} placeholder="—" />
                </div>
                <div>
                  <Label>Alto (mm)</Label>
                  <input type="number" {...register('dim_alto')} className={inputCls} placeholder="—" />
                  <Hint>Dejar vacío si es regulable</Hint>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alto mínimo (mm)</Label>
                  <input type="number" {...register('dim_alto_min')} className={inputCls} placeholder="—" />
                  <Hint>Para altura regulable</Hint>
                </div>
                <div>
                  <Label>Alto máximo (mm)</Label>
                  <input type="number" {...register('dim_alto_max')} className={inputCls} placeholder="—" />
                </div>
              </div>
            </fieldset>

            <Card>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Peso (kg)</Label>
                  <input type="number" step="0.01" {...register('peso_kg')} className={inputCls} placeholder="—" />
                </div>
                <div>
                  <Label>Volumen (m³)</Label>
                  <input type="number" step="0.0001" {...register('volumen_m3')} className={inputCls} placeholder="—" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label>Capacidad</Label>
                  <input {...register('capacidad')} className={inputCls} placeholder='Ej: "50 L" o "20 bandejas"' />
                </div>
                <div>
                  <Label>Dim. canasto (mm)</Label>
                  <input {...register('dimensiones_canasto_mm')} className={inputCls} placeholder="Ej: 500×500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'tecnico' && (
          <div className="space-y-5 min-h-[32rem]">
            <p className="text-xs text-[#9E9080] italic">Todos los campos son opcionales.</p>
            <Card>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <Label>Potencia (kW)</Label>
                  <input type="number" step="0.01" {...register('potencia_kw')} className={inputCls} placeholder="—" />
                </div>
                <div>
                  <Label>Consumo de gas (m³/h)</Label>
                  <input type="number" step="0.01" {...register('consumo_gas_m3h')} className={inputCls} placeholder="—" />
                </div>
                <div>
                  <Label>Rejilla (mm)</Label>
                  <input {...register('rejilla_mm')} className={inputCls} placeholder="Ej: 560×524" />
                </div>
              </div>
              <ListField
                label="Accesorios incluidos"
                hint="Escribí un accesorio y presioná Enter o Agregar"
                items={accesorios}
                onChange={items => setValue('accesorios', items)}
                placeholder="Ej: Cesta porta-vajilla"
              />
              <ListField
                label="Características generales"
                hint="Escribí una característica y presioná Enter o Agregar"
                items={caracteristicas}
                onChange={items => setValue('caracteristicas', items)}
                placeholder="Ej: Construcción en acero inoxidable"
              />
            </Card>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-[#EBE5DC]">
          <span className="text-xs text-[#9E9080]">* Campos obligatorios</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] disabled:opacity-60 transition-all shadow-lg shadow-[#C41B2E]/20 cursor-pointer"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />{isEdit ? 'Guardar cambios' : 'Crear producto'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
