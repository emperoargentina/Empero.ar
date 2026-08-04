// src/pages/admin/views/FamilyForm.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Plus, X, Layers, Tag, Boxes } from 'lucide-react'
import { CATEGORIAS, type Producto } from '@/types/producto'
import type { ProductFamily } from '@/types/family'
import { updateFamily, addChildrenToFamily, listUnassignedChildren } from '@/lib/adminFamilies'
import { getProductos, invalidateProductosCache } from '@/lib/productosCache'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { CATEGORIA_ICONS } from '@/lib/categoriaIcons'
import { FamilyChildPickerModal } from '@/components/admin/FamilyChildPickerModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormValues {
  nombre: string
  categoria: string
  cloudinary_url: string
  cloudinary_image_id: string
  caracteristicas: string[]
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="block text-[13px] font-bold uppercase tracking-wider mb-1.5 text-[#1A1613]">{children}</Label>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9E9080]">{children}</p>
}

const fieldCls = 'border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] h-10 focus-visible:ring-2 focus-visible:ring-[#C41B2E]/15 focus-visible:border-[#C41B2E]'

// Card de sección con icono de color — mismo lenguaje visual que ProductForm.
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
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function ListField({
  hint, items, onChange, placeholder,
}: {
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
      <div className="flex gap-2">
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
        <div className="mt-3 rounded-lg border border-[#EBE5DC] overflow-hidden">
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

export function FamilyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [family, setFamily] = useState<ProductFamily | null>(null)
  const [allProductos, setAllProductos] = useState<Producto[]>([])
  const [variants, setVariants] = useState<Producto[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  const { register, control, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { nombre: '', categoria: '', cloudinary_url: '', cloudinary_image_id: '', caracteristicas: [] },
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError('')
    const load = async () => {
      const [{ data: fam, error }, { data: productos }] = await Promise.all([
        supabase.from('product_families').select('*').eq('id', id).single(),
        getProductos(),
      ])
      if (error || !fam) {
        setLoadError('Familia no encontrada')
      } else {
        setFamily(fam as ProductFamily)
        reset({
          nombre: fam.nombre,
          categoria: fam.categoria,
          cloudinary_url: fam.cloudinary_url ?? '',
          cloudinary_image_id: fam.cloudinary_image_id ?? '',
          caracteristicas: fam.caracteristicas_generales ?? [],
        })
        setAllProductos(productos)
        setVariants(productos.filter(p => p.familia_id === id))
      }
      setLoading(false)
    }
    void load()
  }, [id, reset])

  const unassignedChildren = useMemo(() => listUnassignedChildren(allProductos), [allProductos])

  const handleAddChildren = async (productIds: string[], categoriaBatch: string) => {
    if (!family) return
    const { error } = await addChildrenToFamily(family, productIds, categoriaBatch)
    if (error) { toast.error('Error al agregar productos: ' + error); return }
    toast.success(`${productIds.length} producto${productIds.length !== 1 ? 's' : ''} agregado${productIds.length !== 1 ? 's' : ''} a «${family.nombre}»`)
    setPickerOpen(false)
    invalidateProductosCache()
    const [{ data: productos }, { data: fam }] = await Promise.all([
      getProductos(true),
      supabase.from('product_families').select('*').eq('id', family.id).single(),
    ])
    setAllProductos(productos)
    setVariants(productos.filter(p => p.familia_id === family.id))
    if (fam) setFamily(fam as ProductFamily)
  }

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    const { error } = await updateFamily(id, {
      nombre: values.nombre,
      categoria: values.categoria,
      cloudinary_url: values.cloudinary_url.trim() ? values.cloudinary_url.trim() : null,
      cloudinary_image_id: values.cloudinary_image_id.trim() ? values.cloudinary_image_id.trim() : null,
      caracteristicas_generales: values.caracteristicas.length ? values.caracteristicas : null,
    })
    if (error) {
      toast.error('Error al guardar la familia: ' + error)
      return
    }
    invalidateProductosCache()
    toast.success('Familia actualizada')
    navigate('/admin/productos')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-24 justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#C41B2E]" />
        <span className="text-sm text-[#9E9080]">Cargando familia...</span>
      </div>
    )
  }

  if (loadError || !family) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-600">{loadError || 'Familia no encontrada'}</div>
        <Link to="/admin/productos" className="inline-flex items-center gap-2 text-sm font-medium text-[#C41B2E]">
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Link>
      </div>
    )
  }

  const cloudinaryUrl = watch('cloudinary_url')
  const cloudinaryImageId = watch('cloudinary_image_id')
  const caracteristicas = watch('caracteristicas')

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="brandOutline" size="icon" className="rounded-lg">
          <Link to="/admin/productos">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold text-[#1A1613] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C41B2E]" />
            Editar familia
          </h1>
          <p className="text-xs text-[#9E9080]">
            Nombre, categoría e imagen de acá son los que ve el catálogo — cada variante conserva su propio nombre
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full pb-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <SectionCard
            dataTour="tour-family-form-identity"
            icon={Tag}
            tint="bg-[#FFE4E6] text-[#C41B2E]"
            title="Datos de la familia"
            description="Nombre, categoría, imagen y características compartidas"
            className="h-full flex flex-col"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <FieldLabel>Nombre *</FieldLabel>
                <Input {...register('nombre', { required: true })} className={fieldCls} />
              </div>
              <div>
                <FieldLabel>Categoría *</FieldLabel>
                <Controller
                  control={control}
                  name="categoria"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldCls}>
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
              url={cloudinaryUrl || null}
              publicId={cloudinaryImageId || null}
              onChange={(url, publicId) => {
                setValue('cloudinary_url', url ?? '')
                setValue('cloudinary_image_id', publicId ?? '')
              }}
            />
            <div>
              <FieldLabel>Características generales</FieldLabel>
              <ListField
                hint="Se comparten entre todas las variantes de la familia"
                items={caracteristicas}
                onChange={items => setValue('caracteristicas', items)}
                placeholder="Ej: Construcción en acero inoxidable"
              />
            </div>
          </SectionCard>

          <SectionCard
            dataTour="tour-family-form-variants"
            icon={Boxes}
            tint="bg-indigo-100 text-indigo-600"
            title="Variantes de esta familia"
            description="Los productos hijo que forman parte de esta carpeta"
            className="h-full flex flex-col"
          >
            <div className="flex-1 rounded-lg border border-[#EBE5DC] overflow-y-auto divide-y divide-[#F0EAE2] min-h-[220px]">
              {variants.map(v => (
                <Link
                  key={v.id}
                  to={`/admin/productos/${v.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-[#FAF8F4] transition-colors"
                >
                  <span className="text-[#1A1613] font-medium">{v.etiqueta || v.nombre}</span>
                  <span className="font-mono text-xs text-[#6B6159] bg-[#F4F0E8] px-1.5 py-0.5 rounded">{v.codigo}</span>
                </Link>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41B2E] hover:bg-[#FFF0F1] hover:text-[#C41B2E] w-fit px-3"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar variante
            </Button>
          </SectionCard>
        </div>

        <div className="fixed bottom-0 inset-x-0 lg:inset-x-auto lg:right-6 lg:bottom-6 z-30 border-t lg:border-0 border-[#EBE5DC] bg-white/95 lg:bg-transparent backdrop-blur lg:backdrop-blur-none shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:shadow-none">
          <div className="px-4 py-3 lg:p-0 flex justify-end">
            <Button
              data-tour="tour-family-form-submit"
              type="submit"
              variant="brand"
              disabled={isSubmitting}
              className="w-full lg:w-auto px-6 py-3 lg:py-2.5 h-auto rounded-xl"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />Guardar cambios</>
              }
            </Button>
          </div>
        </div>
      </form>

      <FamilyChildPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        family={family}
        unassigned={unassignedChildren}
        onConfirm={handleAddChildren}
      />
    </div>
  )
}
