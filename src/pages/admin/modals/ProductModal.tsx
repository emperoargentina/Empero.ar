// src/pages/admin/modals/ProductModal.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS } from '@/types/producto'
import { toast } from 'sonner'
import { X, Save, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Zod schema ────────────────────────────────────────────────────────────

const schema = z.object({
  nombre:                 z.string().min(1, 'Requerido'),
  codigo:                 z.string().min(1, 'Requerido'),
  categoria:              z.string().min(1, 'Requerido'),
  precio_usd:             z.coerce.number().nullable().optional(),
  stock:                  z.coerce.number().int().min(0).default(0),
  disponible:             z.boolean().default(true),
  modo_disponibilidad:    z.enum(['en_stock', 'por_encargo']),
  cloudinary_url:         z.string().nullable().optional(),
  cloudinary_image_id:    z.string().nullable().optional(),
  voltaje:                z.string().nullable().optional(),
  peso_kg:                z.coerce.number().nullable().optional(),
  volumen_m3:             z.coerce.number().nullable().optional(),
  capacidad:              z.string().nullable().optional(),
  motor_rpm:              z.coerce.number().int().nullable().optional(),
  dimensiones_canasto_mm: z.string().nullable().optional(),
  dim_ancho:              z.coerce.number().nullable().optional(),
  dim_prof:               z.coerce.number().nullable().optional(),
  dim_alto:               z.coerce.number().nullable().optional(),
  temp_lavado:            z.coerce.number().nullable().optional(),
  temp_enjuague:          z.coerce.number().nullable().optional(),
  pot_total:              z.coerce.number().nullable().optional(),
  pot_motor:              z.coerce.number().nullable().optional(),
  prog_cantidad:          z.coerce.number().int().nullable().optional(),
  accesorios:             z.string().default(''),
  caracteristicas:        z.string().default(''),
})

type FormValues = z.infer<typeof schema>

// ─── Helpers ───────────────────────────────────────────────────────────────

function toForm(p: Producto): FormValues {
  return {
    nombre:                 p.nombre,
    codigo:                 p.codigo,
    categoria:              p.categoria,
    precio_usd:             p.precio_usd ?? undefined,
    stock:                  p.stock,
    disponible:             p.disponible,
    modo_disponibilidad:    p.modo_disponibilidad,
    cloudinary_url:         p.cloudinary_url ?? '',
    cloudinary_image_id:    p.cloudinary_image_id ?? '',
    voltaje:                p.voltaje ?? '',
    peso_kg:                p.peso_kg ?? undefined,
    volumen_m3:             p.volumen_m3 ?? undefined,
    capacidad:              p.capacidad ?? '',
    motor_rpm:              p.motor_rpm ?? undefined,
    dimensiones_canasto_mm: p.dimensiones_canasto_mm ?? '',
    dim_ancho:              p.dimensiones_mm?.Ancho ?? undefined,
    dim_prof:               p.dimensiones_mm?.Profundidad ?? undefined,
    dim_alto:               p.dimensiones_mm?.Alto ?? undefined,
    temp_lavado:            p.temperaturas_c?.Lavado ?? undefined,
    temp_enjuague:          p.temperaturas_c?.Enjuague ?? undefined,
    pot_total:              p.potencias_kw?.Total ?? undefined,
    pot_motor:              p.potencias_kw?.Motor ?? undefined,
    prog_cantidad:          p.programas?.Cantidad ?? undefined,
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
    categoria:              v.categoria,
    precio_usd:             v.precio_usd ?? null,
    stock:                  v.stock,
    disponible:             v.disponible,
    modo_disponibilidad:    v.modo_disponibilidad,
    cloudinary_url:         nullIfEmpty(v.cloudinary_url),
    cloudinary_image_id:    nullIfEmpty(v.cloudinary_image_id),
    voltaje:                nullIfEmpty(v.voltaje),
    peso_kg:                v.peso_kg ?? null,
    volumen_m3:             v.volumen_m3 ?? null,
    capacidad:              nullIfEmpty(v.capacidad),
    motor_rpm:              v.motor_rpm ?? null,
    dimensiones_canasto_mm: nullIfEmpty(v.dimensiones_canasto_mm),
    dimensiones_mm:
      v.dim_ancho || v.dim_prof || v.dim_alto
        ? { Ancho: v.dim_ancho ?? undefined, Profundidad: v.dim_prof ?? undefined, Alto: v.dim_alto ?? undefined }
        : null,
    temperaturas_c:
      v.temp_lavado || v.temp_enjuague
        ? { Lavado: v.temp_lavado ?? undefined, Enjuague: v.temp_enjuague ?? undefined }
        : null,
    potencias_kw:
      v.pot_total
        ? { Total: v.pot_total, ...(v.pot_motor ? { Motor: v.pot_motor } : {}) }
        : null,
    programas:
      v.prog_cantidad ? { Cantidad: v.prog_cantidad } : null,
    accesorios_incluidos:
      v.accesorios.trim() ? v.accesorios.split('\n').map(s => s.trim()).filter(Boolean) : null,
    caracteristicas_generales:
      v.caracteristicas.trim() ? v.caracteristicas.split('\n').map(s => s.trim()).filter(Boolean) : null,
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

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
  'w-full px-3 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-1 focus:ring-[rgba(196,27,46,0.2)] transition-colors placeholder:text-[#C0B5A8]'

// ─── Main component ─────────────────────────────────────────────────────────

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
    resolver: zodResolver(schema),
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBE5DC]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1613]">
              {isEdit ? 'Editar producto' : 'Agregar producto'}
            </h2>
            {isEdit && <p className="text-xs text-[#9E9080] mt-0.5">{producto!.codigo}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9E9080] hover:bg-[#F4F0E8] hover:text-[#1A1613] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="mx-6 mt-4 grid grid-cols-4 h-9 bg-[#F4F0E8] rounded-xl p-1">
              <TabsTrigger value="basico"  className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Básico</TabsTrigger>
              <TabsTrigger value="imagen"  className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Imagen</TabsTrigger>
              <TabsTrigger value="fisico"  className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Físico</TabsTrigger>
              <TabsTrigger value="tecnico" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Técnico</TabsTrigger>
            </TabsList>

            {/* TAB: Básico */}
            <TabsContent value="basico" className="px-6 pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre *" error={errors.nombre?.message}>
                  <input {...register('nombre')} className={inputCls} placeholder="Ej: Lavavajillas Industrial LV-500" />
                </Field>
                <Field label="Código *" error={errors.codigo?.message}>
                  <input {...register('codigo')} className={inputCls} placeholder="Ej: EMP.LV-500" />
                </Field>
              </div>

              <Field label="Categoría *" error={errors.categoria?.message}>
                <select {...register('categoria')} className={inputCls + ' cursor-pointer'}>
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio (USD)" error={errors.precio_usd?.message}>
                  <input type="number" step="0.01" min="0" {...register('precio_usd')} className={inputCls} placeholder="0.00" />
                </Field>
                <Field label="Stock actual" error={errors.stock?.message}>
                  <input type="number" min="0" {...register('stock')} className={inputCls} placeholder="0" />
                </Field>
              </div>

              <Field label="Modo de disponibilidad *">
                <div className="grid grid-cols-2 gap-2">
                  {(['en_stock', 'por_encargo'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-3 px-3 py-2.5 border border-[#EBE5DC] rounded-lg cursor-pointer hover:border-[#C41B2E] has-[:checked]:border-[#C41B2E] has-[:checked]:bg-[rgba(196,27,46,0.03)] transition-colors">
                      <input type="radio" value={opt} {...register('modo_disponibilidad')} className="accent-[#C41B2E]" />
                      <span className="text-sm text-[#1A1613] font-medium">
                        {opt === 'en_stock' ? 'En stock' : 'Por encargo'}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('disponible')} className="w-4 h-4 accent-[#C41B2E] rounded" />
                <div>
                  <span className="text-sm font-medium text-[#1A1613]">Visible en el catálogo</span>
                  <p className="text-xs text-[#9E9080]">
                    {disponible ? 'El producto aparece en la tienda' : 'El producto está oculto'}
                  </p>
                </div>
              </label>
            </TabsContent>

            {/* TAB: Imagen */}
            <TabsContent value="imagen" className="px-6 pt-5 pb-4 space-y-4">
              <Field label="URL de imagen (Cloudinary)" hint="La URL completa de la imagen optimizada de Cloudinary">
                <input {...register('cloudinary_url')} className={inputCls} placeholder="https://res.cloudinary.com/..." />
              </Field>
              <Field label="ID público Cloudinary" hint="El public_id del recurso en Cloudinary">
                <input {...register('cloudinary_image_id')} className={inputCls} placeholder="empero/productos/lv-500" />
              </Field>

              {watch('cloudinary_url') && (
                <div className="mt-2">
                  <p className="text-xs text-[#9E9080] mb-2">Vista previa:</p>
                  <img
                    src={watch('cloudinary_url') ?? ''}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-[#EBE5DC]"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </TabsContent>

            {/* TAB: Físico */}
            <TabsContent value="fisico" className="px-6 pt-5 pb-4 space-y-4">
              <p className="text-xs text-[#9E9080] -mt-1">Todos los campos son opcionales.</p>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Dimensiones externas</legend>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Ancho (mm)">
                    <input type="number" {...register('dim_ancho')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Profundidad (mm)">
                    <input type="number" {...register('dim_prof')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Alto (mm)">
                    <input type="number" {...register('dim_alto')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Peso (kg)">
                  <input type="number" step="0.01" {...register('peso_kg')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Volumen (m³)">
                  <input type="number" step="0.0001" {...register('volumen_m3')} className={inputCls} placeholder="—" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacidad" hint='Ej: "50 L" o "20 bandejas"'>
                  <input {...register('capacidad')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Dim. canasto (mm)">
                  <input {...register('dimensiones_canasto_mm')} className={inputCls} placeholder="Ej: 500×500" />
                </Field>
              </div>
            </TabsContent>

            {/* TAB: Técnico */}
            <TabsContent value="tecnico" className="px-6 pt-5 pb-4 space-y-4">
              <p className="text-xs text-[#9E9080] -mt-1">Todos los campos son opcionales.</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Voltaje">
                  <input {...register('voltaje')} className={inputCls} placeholder="Ej: 220V / 380V" />
                </Field>
                <Field label="Motor (RPM)">
                  <input type="number" {...register('motor_rpm')} className={inputCls} placeholder="—" />
                </Field>
              </div>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Potencias (kW)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total">
                    <input type="number" step="0.01" {...register('pot_total')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Motor">
                    <input type="number" step="0.01" {...register('pot_motor')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Temperaturas (°C)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lavado">
                    <input type="number" {...register('temp_lavado')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Enjuague">
                    <input type="number" {...register('temp_enjuague')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <Field label="Cantidad de programas">
                <input type="number" {...register('prog_cantidad')} className={inputCls} placeholder="—" />
              </Field>

              <Field label="Accesorios incluidos" hint="Un accesorio por línea">
                <textarea
                  {...register('accesorios')}
                  rows={4}
                  className={inputCls + ' resize-none'}
                  placeholder={"Cesta porta-vajilla\nBandeja de escurrido\nManual de usuario"}
                />
              </Field>

              <Field label="Características generales" hint="Una característica por línea">
                <textarea
                  {...register('caracteristicas')}
                  rows={4}
                  className={inputCls + ' resize-none'}
                  placeholder={"Construcción en acero inoxidable\nDoble pared aislada\nPanel de control digital"}
                />
              </Field>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EBE5DC] bg-[#FAF8F4] rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B6159] hover:text-[#1A1613] hover:bg-[#EBE5DC] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-[#C41B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#B51426] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
