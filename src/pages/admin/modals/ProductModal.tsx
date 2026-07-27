import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS } from '@/types/producto'
import { toast } from 'sonner'
import { X, Save, Loader2, ImageIcon, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  accesorios:             z.string(),
  caracteristicas:        z.string(),
})

type FormValues = z.infer<typeof schema>

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
    accesorios:             (p.accesorios_incluidos ?? []).join('\n'),
    caracteristicas:        (p.caracteristicas_generales ?? []).join('\n'),
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
    accesorios_incluidos:
      v.accesorios.trim() ? v.accesorios.split('\n').map(s => s.trim()).filter(Boolean) : null,
    caracteristicas_generales:
      v.caracteristicas.trim() ? v.caracteristicas.split('\n').map(s => s.trim()).filter(Boolean) : null,
  }
}

function Field({
  label, error, children, hint,
}: {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#4A4540]">{label}</label>
      {children}
      {hint  && !error && <p className="text-xs text-[#9E9080]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[rgba(196,27,46,0.1)] transition-all placeholder:text-[#C0B5A8] bg-white'

const TAB_CLS = 'px-6 pt-5 pb-4 space-y-4 min-h-[28rem]'

interface Props {
  producto: Producto | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ProductModal({ producto, open, onClose, onSaved }: Props) {
  const isEdit = producto != null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      stock: 0,
      disponible: true,
      modo_disponibilidad: 'en_stock',
      accesorios: '',
      caracteristicas: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(producto ? toForm(producto) : {
        stock: 0,
        disponible: true,
        modo_disponibilidad: 'en_stock',
        accesorios: '',
        caracteristicas: '',
      })
    }
  }, [open, producto, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = fromForm(values, isEdit ? producto!.id : undefined)

    let error: unknown
    if (isEdit) {
      const { error: e } = await supabase.from('products').update(payload).eq('id', producto!.id)
      error = e
    } else {
      const { error: e } = await supabase.from('products').insert(payload)
      error = e
    }

    if (error) {
      toast.error(`Error al ${isEdit ? 'guardar' : 'crear'} el producto`)
      console.error(error)
      return
    }

    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
    onSaved()
  }

  if (!open) return null

  const disponible = watch('disponible')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-[#C41B2E]/60 via-[#C41B2E] to-[#C41B2E]/60" />

        <div className="flex items-center justify-between px-8 py-6 border-b border-[#EBE5DC]">
          <div>
            <h2 className="text-xl font-bold text-[#1A1613] tracking-tight">
              {isEdit ? 'Editar producto' : 'Agregar producto'}
            </h2>
            {isEdit && (
              <p className="text-xs text-[#9E9080] mt-0.5 flex items-center gap-1.5">
                <span className="font-mono bg-[#F4F0E8] px-1.5 py-0.5 rounded text-[#6B6159]">{producto!.codigo}</span>
                <span>· {producto!.categoria}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9E9080] hover:bg-[#F4F0E8] hover:text-[#1A1613] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="mx-8 mt-4 grid grid-cols-4 h-10 bg-[#F4F0E8] rounded-xl p-0.5 gap-0.5">
              <TabsTrigger value="basico"  className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm h-full">Básico</TabsTrigger>
              <TabsTrigger value="imagen"  className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm h-full">Imagen</TabsTrigger>
              <TabsTrigger value="fisico"  className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm h-full">Físico</TabsTrigger>
              <TabsTrigger value="tecnico" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm h-full">Técnico</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className={TAB_CLS}>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Nombre *" error={errors.nombre?.message}>
                  <input {...register('nombre')} className={inputCls} placeholder="Ej: Lavavajillas Industrial LV-500" />
                </Field>
                <Field label="Código *" error={errors.codigo?.message}>
                  <input {...register('codigo')} className={inputCls} placeholder="Ej: EMP.LV-500" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Etiqueta de variante" hint="Texto en el selector de variantes">
                  <input {...register('etiqueta')} className={inputCls} placeholder='Ej: "2 puertas — 300 Lt"' />
                </Field>
                <Field label="ID de familia" hint="Mismo ID en variantes del mismo producto">
                  <input {...register('familia_id')} className={inputCls} placeholder="Ej: lavavajillas-capota" />
                </Field>
              </div>

              <Field label="Categoría *" error={errors.categoria?.message}>
                <select {...register('categoria')} className={inputCls + ' cursor-pointer'}>
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Precio (USD)" error={errors.precio_usd?.message}>
                  <input type="number" step="0.01" min="0" {...register('precio_usd')} className={inputCls} placeholder="0.00" />
                </Field>
                <Field label="Stock actual" error={errors.stock?.message}>
                  <input type="number" min="0" {...register('stock')} className={inputCls} placeholder="0" />
                </Field>
              </div>

              <Field label="Modo de disponibilidad *">
                <div className="grid grid-cols-2 gap-3">
                  {(['en_stock', 'por_encargo'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-3 px-4 py-3 border border-[#EBE5DC] rounded-xl cursor-pointer hover:border-[#C41B2E]/50 has-[:checked]:border-[#C41B2E] has-[:checked]:bg-[rgba(196,27,46,0.03)] has-[:checked]:shadow-sm transition-all">
                      <input type="radio" value={opt} {...register('modo_disponibilidad')} className="accent-[#C41B2E]" />
                      <span className="text-sm text-[#1A1613] font-medium">
                        {opt === 'en_stock' ? 'En stock' : 'Por encargo'}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <label className="flex items-center gap-3 p-4 border border-[#EBE5DC] rounded-xl cursor-pointer hover:border-[#D8D0C4] transition-colors">
                <input type="checkbox" {...register('disponible')} className="w-4 h-4 accent-[#C41B2E] rounded" />
                <div>
                  <span className="text-sm font-medium text-[#1A1613]">Visible en el catálogo</span>
                  <p className="text-xs text-[#9E9080] mt-0.5">
                    {disponible ? 'El producto aparece en la tienda' : 'El producto está oculto'}
                  </p>
                </div>
              </label>
            </TabsContent>

            <TabsContent value="imagen" className={TAB_CLS}>
              <div className="flex flex-col items-center justify-center h-full min-h-[20rem] text-center gap-6">
                <div className="w-full max-w-md space-y-5">
                  <Field label="URL de imagen (Cloudinary)" hint="URL completa optimizada de la imagen">
                    <input {...register('cloudinary_url')} className={inputCls} placeholder="https://res.cloudinary.com/..." />
                  </Field>
                  <Field label="ID público Cloudinary" hint="public_id del recurso en Cloudinary">
                    <input {...register('cloudinary_image_id')} className={inputCls} placeholder="empero/productos/lv-500" />
                  </Field>
                </div>

                {watch('cloudinary_url') && (
                  <div className="w-full max-w-md p-5 bg-[#FAF8F4] rounded-xl border border-[#EBE5DC]">
                    <p className="text-xs text-[#9E9080] mb-3 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Vista previa
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={watch('cloudinary_url') ?? ''}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-[#EBE5DC] bg-white"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="text-left text-xs text-[#9E9080] space-y-1">
                        <p className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Imagen configurada</p>
                        <p className="truncate max-w-[200px] font-mono text-[11px] text-[#C0B5A8]">{watch('cloudinary_url')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="fisico" className={TAB_CLS}>
              <p className="text-xs text-[#9E9080] -mt-1 italic">Todos los campos son opcionales.</p>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-5 space-y-4 bg-[#FAF8F4]/50">
                <legend className="px-3 text-xs font-semibold text-[#6B6159] uppercase tracking-wider bg-white rounded-md py-1.5 border border-[#EBE5DC]">Dimensiones externas</legend>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Ancho (mm)">
                    <input type="number" {...register('dim_ancho')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Profundidad (mm)">
                    <input type="number" {...register('dim_prof')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Alto (mm)" hint="Dejar vacío si es regulable">
                    <input type="number" {...register('dim_alto')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Alto mínimo (mm)" hint="Para altura regulable">
                    <input type="number" {...register('dim_alto_min')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Alto máximo (mm)">
                    <input type="number" {...register('dim_alto_max')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Peso (kg)">
                  <input type="number" step="0.01" {...register('peso_kg')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Volumen (m³)">
                  <input type="number" step="0.0001" {...register('volumen_m3')} className={inputCls} placeholder="—" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Capacidad" hint='Ej: "50 L" o "20 bandejas"'>
                  <input {...register('capacidad')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Dim. canasto (mm)">
                  <input {...register('dimensiones_canasto_mm')} className={inputCls} placeholder="Ej: 500×500" />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="tecnico" className={TAB_CLS}>
              <p className="text-xs text-[#9E9080] -mt-1 italic">Todos los campos son opcionales.</p>

              <div className="grid grid-cols-3 gap-5">
                <Field label="Potencia (kW)">
                  <input type="number" step="0.01" {...register('potencia_kw')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Consumo de gas (m³/h)">
                  <input type="number" step="0.01" {...register('consumo_gas_m3h')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Rejilla (mm)">
                  <input {...register('rejilla_mm')} className={inputCls} placeholder="Ej: 560×524" />
                </Field>
              </div>

              <Field label="Accesorios incluidos" hint="Uno por línea">
                <textarea
                  {...register('accesorios')}
                  rows={5}
                  className={inputCls + ' resize-none'}
                  placeholder={"Cesta porta-vajilla\nBandeja de escurrido\nManual de usuario"}
                />
              </Field>

              <Field label="Características generales" hint="Una por línea">
                <textarea
                  {...register('caracteristicas')}
                  rows={5}
                  className={inputCls + ' resize-none'}
                  placeholder={"Construcción en acero inoxidable\nDoble pared aislada\nPanel de control digital"}
                />
              </Field>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-[#EBE5DC] bg-[#FAF8F4] rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-[#6B6159] hover:text-[#1A1613] hover:bg-[#EBE5DC] rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#C41B2E]/20 cursor-pointer"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />{isEdit ? 'Guardar cambios' : 'Crear producto'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
