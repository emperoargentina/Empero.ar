// src/pages/admin/views/FamilyForm.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Plus, X, Layers } from 'lucide-react'
import { CATEGORIAS, type Producto } from '@/types/producto'
import type { ProductFamily } from '@/types/family'
import { updateFamily } from '@/lib/adminFamilies'
import { getProductos } from '@/lib/productosCache'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface FormValues {
  nombre: string
  categoria: string
  cloudinary_url: string
  cloudinary_image_id: string
  caracteristicas: string[]
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#9E9080]">{children}</p>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9E9080]">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl p-5 space-y-4 bg-white border border-[#EBE5DC] ${className}`}>{children}</div>
}

const inputCls =
  'w-full px-3 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[rgba(196,27,46,0.1)] transition-all placeholder:text-[#C0B5A8] bg-white'

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

export function FamilyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [family, setFamily] = useState<ProductFamily | null>(null)
  const [variants, setVariants] = useState<Producto[]>([])

  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm<FormValues>({
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
        setVariants(productos.filter(p => p.familia_id === id))
      }
      setLoading(false)
    }
    void load()
  }, [id, reset])

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
    toast.success('Familia actualizada — se propagó a todas sus variantes')
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
        <Link
          to="/admin/productos"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#EBE5DC] text-[#6B6159] hover:bg-[#F4F0E8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#1A1613] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C41B2E]" />
            Editar familia
          </h1>
          <p className="text-xs text-[#9E9080]">
            Los cambios se aplican a las {variants.length} variante{variants.length !== 1 ? 's' : ''} de esta familia
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
        <Card>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Nombre *</Label>
              <input {...register('nombre', { required: true })} className={inputCls} />
            </div>
            <div>
              <Label>Categoría *</Label>
              <select {...register('categoria', { required: true })} className={inputCls + ' cursor-pointer'}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
          <ListField
            label="Características generales"
            hint="Se comparten entre todas las variantes de la familia"
            items={caracteristicas}
            onChange={items => setValue('caracteristicas', items)}
            placeholder="Ej: Construcción en acero inoxidable"
          />
        </Card>

        <Card>
          <Label>Variantes de esta familia</Label>
          <div className="rounded-lg border border-[#EBE5DC] overflow-hidden divide-y divide-[#F0EAE2]">
            {variants.map(v => (
              <Link
                key={v.id}
                to={`/admin/productos/${v.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-[#FAF8F4] transition-colors"
              >
                <span className="text-[#1A1613] font-medium">{v.etiqueta ?? v.codigo}</span>
                <span className="font-mono text-xs text-[#6B6159] bg-[#F4F0E8] px-1.5 py-0.5 rounded">{v.codigo}</span>
              </Link>
            ))}
          </div>
          <Link
            to={`/admin/productos/nuevo?familia_id=${encodeURIComponent(family.id)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41B2E]"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar variante
          </Link>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] disabled:opacity-60 transition-all shadow-lg shadow-[#C41B2E]/20 cursor-pointer"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />Guardar cambios</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
