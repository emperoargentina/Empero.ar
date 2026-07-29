# Admin Product Form (Patagonia-style layout) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Empero's product create/edit modal (`ProductModal.tsx`) with a dedicated full-page form (`/admin/productos/nuevo`, `/admin/productos/:id`) styled after Patagonia Ultra Bike's `RaceForm`, plus real drag&drop image upload to Cloudinary via a new signed edge endpoint.

**Architecture:** Vite + React 19 + React Router 7 SPA (`Empero.ar`). Admin routes live under `/admin/*` (`src/pages/admin/AdminRoot.tsx`), rendered inside `AdminPanel`'s `<Outlet />`. Data layer is Supabase (`products` table) via the browser client in `src/lib/supabase.ts`. Serverless logic lives in `api/*.ts` as Vercel Edge Functions (Web-standard `Request`/`Response`, no Node-only APIs).

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, react-hook-form + zod (`@hookform/resolvers/zod`), Tailwind CSS 3, lucide-react, sonner (toasts), Supabase JS client, Vercel Edge Functions, Cloudinary (signed upload via raw `fetch`, no SDK).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-29-admin-product-form-design.md` — every task below implements one of its sections.
- No test framework exists in this project (`package.json` has no `test` script, no vitest/jest). Do **not** add one. Every task's verification step is manual: run `npm run dev`, use the feature in the browser, confirm the described behavior. This replaces the automated "run test" steps a stricter TDD flow would use.
- Path alias `@/*` → `./src/*` (see `tsconfig.app.json`). Use it for all intra-`src` imports, matching existing files.
- `api/*.ts` files are **not** type-checked by `npm run build` (excluded from both `tsconfig.app.json` and `tsconfig.node.json`, deploy-time transpiled by Vercel). Still write them as valid, strict TypeScript — just don't expect `tsc -b` to catch mistakes there.
- Follow the existing edge-function pattern from `api/products.ts`: `export const config = { runtime: 'edge' }`, manual CORS headers, `process.env.SUPABASE_URL` / `process.env.SUPABASE_SERVICE_KEY` for the Supabase service client (same names already used in `api/products.ts` — do not rename or "fix", that's out of scope).
- Empero palette only (do not import Patagonia's cyan/slate): accent `#C41B2E` (+ gradient `#C41B2E`→`#B51426` on primary buttons), text `#1A1613`/`#6B6159`/`#9E9080`/`#C0B5A8`, borders `#EBE5DC`, surfaces `#FFFFFF`/`#FAF8F4`/`#F4F0E8`.
- `tsconfig.app.json` has `noUnusedLocals`/`noUnusedParameters` — no dead imports or unused vars in any `src/` file you write.
- Don't touch `PriceVariantsEditor`-style sub-resources — Empero products have no child tables, this is out of scope (spec: "Fuera de alcance").

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `api/upload.ts` | Create | Edge function: validates Supabase session, signs and proxies an image upload to Cloudinary |
| `src/components/admin/ImageUpload.tsx` | Create | Drag&drop upload widget (progress bar, preview, remove), calls `/api/upload` |
| `src/pages/admin/views/ProductForm.tsx` | Create | Full-page create/edit form (tabs, cards, submit bar) — replaces the modal's form logic |
| `src/pages/admin/AdminRoot.tsx` | Modify | Add `productos/nuevo` and `productos/:id` routes |
| `src/pages/admin/views/Products.tsx` | Modify | Navigate to the new routes instead of opening the modal |
| `src/pages/admin/modals/ProductModal.tsx` | Delete | Superseded by `ProductForm.tsx` |

---

### Task 1: `api/upload.ts` — signed Cloudinary upload endpoint

**Files:**
- Create: `api/upload.ts`

**Interfaces:**
- Consumes: `process.env.SUPABASE_URL`, `process.env.SUPABASE_SERVICE_KEY`, `process.env.CLOUDINARY_CLOUD_NAME`, `process.env.CLOUDINARY_API_KEY`, `process.env.CLOUDINARY_API_SECRET` (already set in the Vercel project — same vars `api/products.ts` and `upload-images-cloudinary.mjs` use)
- Produces: `POST /api/upload` — accepts `multipart/form-data` with a `file` field and an `Authorization: Bearer <supabase_access_token>` header. Returns `200 { url: string, public_id: string }` on success, or `4xx/5xx { error: string }` on failure. This is the contract `ImageUpload.tsx` (Task 2) will call.

- [ ] **Step 1: Write `api/upload.ts`**

```typescript
// api/upload.ts
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const CLOUDINARY_FOLDER = 'empero/productos'

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!supabaseUrl || !supabaseServiceKey || !cloudName || !apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Sesión inválida' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const incomingForm = await req.formData()
  const file = incomingForm.get('file')
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'Falta el archivo' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'Archivo demasiado grande (máx 10MB)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Tipo de archivo no permitido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`
  const signature = await sha1Hex(paramsToSign)

  const cloudinaryForm = new FormData()
  cloudinaryForm.set('file', file)
  cloudinaryForm.set('api_key', apiKey)
  cloudinaryForm.set('timestamp', String(timestamp))
  cloudinaryForm.set('folder', CLOUDINARY_FOLDER)
  cloudinaryForm.set('signature', signature)

  const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: cloudinaryForm,
  })

  if (!cloudinaryRes.ok) {
    const errText = await cloudinaryRes.text()
    return new Response(JSON.stringify({ error: `Error de Cloudinary: ${errText}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const result = (await cloudinaryRes.json()) as { secure_url: string; public_id: string }

  return new Response(
    JSON.stringify({ url: result.secure_url, public_id: result.public_id }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...cors } },
  )
}
```

- [ ] **Step 2: Sanity-check the file**

Run: `node -e "require('typescript').transpileModule(require('fs').readFileSync('api/upload.ts','utf8'), {compilerOptions:{module:99,target:99}})" `
Expected: no thrown syntax error (this only checks the file parses as valid TS/ESNext syntax — full type-checking happens later when `ImageUpload.tsx` calls it end-to-end in Task 2/3, since `api/*.ts` isn't wired into `tsc -b`).

- [ ] **Step 3: Commit**

```bash
git add api/upload.ts
git commit -m "Add signed Cloudinary upload edge endpoint for admin"
```

---

### Task 2: `ImageUpload.tsx` — drag&drop upload widget

**Files:**
- Create: `src/components/admin/ImageUpload.tsx`

**Interfaces:**
- Consumes: `supabase` from `@/lib/supabase` (for `auth.getSession()`), `POST /api/upload` from Task 1
- Produces: `ImageUpload` component with props `{ url: string | null; publicId: string | null; onChange: (url: string | null, publicId: string | null) => void }`. `ProductForm.tsx` (Task 3) renders this in its Imagen tab.

- [ ] **Step 1: Write `src/components/admin/ImageUpload.tsx`**

```tsx
// src/components/admin/ImageUpload.tsx
import { useRef, useState, useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  url: string | null
  publicId: string | null
  onChange: (url: string | null, publicId: string | null) => void
}

const MAX_MB = 10
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'

export function ImageUpload({ url, publicId, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Archivo demasiado grande (máx ${MAX_MB}MB)`)
      return
    }
    setError('')
    setUploading(true)
    setProgress(0)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setError('Sesión expirada, volvé a iniciar sesión')
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      setUploading(false)
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText) as { url: string; public_id: string }
        onChange(res.url, res.public_id)
      } else {
        try {
          const res = JSON.parse(xhr.responseText) as { error?: string }
          setError(res.error || 'Error al subir la imagen')
        } catch {
          setError('Error al subir la imagen')
        }
      }
    }
    xhr.onerror = () => { setUploading(false); setError('Error de red') }
    xhr.open('POST', '/api/upload')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)
  }, [onChange])

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    void upload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      {url ? (
        <div className="relative rounded-xl overflow-hidden border border-[#EBE5DC] bg-white">
          <img src={url} alt="preview" className="w-full h-56 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="absolute top-2 right-2 rounded-full p-1.5 bg-black/60 hover:bg-black/75 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          {publicId && (
            <p className="px-3 py-2 text-[11px] font-mono text-[#9E9080] truncate border-t border-[#EBE5DC]">
              {publicId}
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 h-56 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? '#C41B2E' : '#EBE5DC',
            background: dragging ? 'rgba(196,27,46,0.04)' : '#FAF8F4',
          }}
        >
          <ImageIcon className="w-6 h-6 text-[#C0B5A8]" />
          <p className="text-sm text-[#9E9080]">Arrastrá o hacé click para subir</p>
          <p className="text-xs text-[#C0B5A8]">JPG, PNG, WebP — máx {MAX_MB}MB</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1 text-[#9E9080]">
            <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Subiendo...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#EBE5DC]">
            <div className="h-full rounded-full bg-[#C41B2E] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors mentioning `ImageUpload.tsx` (the component isn't imported anywhere yet, so this only confirms the file itself is well-typed in isolation — TS still checks unreferenced files under `include: ["src"]`).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ImageUpload.tsx
git commit -m "Add drag-and-drop image upload widget for admin"
```

---

### Task 3: `ProductForm.tsx` — full-page create/edit form

**Files:**
- Create: `src/pages/admin/views/ProductForm.tsx`

**Interfaces:**
- Consumes: `supabase` (`@/lib/supabase`), `Producto`/`CATEGORIAS` (`@/types/producto`), `toast` (`sonner`), `ImageUpload` (Task 2), `useParams`/`useNavigate`/`Link` (`react-router-dom`)
- Produces: `ProductForm` component (named export, no props — reads `id` from the URL via `useParams`). Task 4 wires it to `productos/nuevo` and `productos/:id`.

- [ ] **Step 1: Write `src/pages/admin/views/ProductForm.tsx`**

```tsx
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
  ArrowLeft, Save, Loader2, FileText, ImageIcon, Ruler, Wrench,
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
  accesorios:             z.string(),
  caracteristicas:        z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_DEFAULTS: FormValues = {
  nombre: '', codigo: '', familia_id: '', etiqueta: '', categoria: '',
  precio_usd: undefined, stock: 0, disponible: true, modo_disponibilidad: 'en_stock',
  cloudinary_url: '', cloudinary_image_id: '',
  peso_kg: undefined, volumen_m3: undefined, capacidad: '', dimensiones_canasto_mm: '',
  dim_ancho: undefined, dim_prof: undefined, dim_alto: undefined, dim_alto_min: undefined, dim_alto_max: undefined,
  potencia_kw: undefined, consumo_gas_m3h: undefined, rejilla_mm: '',
  accesorios: '', caracteristicas: '',
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

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#9E9080]">{children}</p>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9E9080]">{children}</p>
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl p-5 space-y-4 bg-white border border-[#EBE5DC]">{children}</div>
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
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError('Producto no encontrado')
          return
        }
        setProducto(data as Producto)
        reset(toForm(data as Producto))
      })
      .finally(() => setLoading(false))
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
          <div className="space-y-5">
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
          <Card>
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
          <div className="space-y-5">
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
          <div className="space-y-5">
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
              <div>
                <Label>Accesorios incluidos</Label>
                <textarea {...register('accesorios')} rows={5} className={inputCls + ' resize-none'} placeholder={'Cesta porta-vajilla\nBandeja de escurrido\nManual de usuario'} />
                <Hint>Uno por línea</Hint>
              </div>
              <div>
                <Label>Características generales</Label>
                <textarea {...register('caracteristicas')} rows={5} className={inputCls + ' resize-none'} placeholder={'Construcción en acero inoxidable\nDoble pared aislada\nPanel de control digital'} />
                <Hint>Una por línea</Hint>
              </div>
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors in `ProductForm.tsx`. (It isn't routed yet, so this only validates types, not runtime behavior — Task 4 wires the route so it can be opened in the browser.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/views/ProductForm.tsx
git commit -m "Add full-page product create/edit form"
```

---

### Task 4: Wire routes in `AdminRoot.tsx`

**Files:**
- Modify: `src/pages/admin/AdminRoot.tsx`

**Interfaces:**
- Consumes: `ProductForm` from Task 3 (`./views/ProductForm`)
- Produces: routes `/admin/productos/nuevo` and `/admin/productos/:id`, both rendering `<ProductForm />`. Task 5's `navigate()` calls target these paths.

- [ ] **Step 1: Add the import**

In `src/pages/admin/AdminRoot.tsx`, change:

```tsx
import { Dashboard } from './views/Dashboard'
import { Products } from './views/Products'
import { Destacados } from './views/Destacados'
```

to:

```tsx
import { Dashboard } from './views/Dashboard'
import { Products } from './views/Products'
import { ProductForm } from './views/ProductForm'
import { Destacados } from './views/Destacados'
```

- [ ] **Step 2: Add the routes**

Change:

```tsx
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<Products />} />
        <Route path="destacados" element={<Destacados />} />
```

to:

```tsx
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<Products />} />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/:id" element={<ProductForm />} />
        <Route path="destacados" element={<Destacados />} />
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`
Navigate to `http://localhost:5173/admin/productos/nuevo` (log in with an admin Supabase account if prompted).
Expected: the new "Agregar producto" page renders (header, tabs, cards, save bar) — even though nothing links to it yet.

Then navigate to `http://localhost:5173/admin/productos/<any-existing-product-id>` (copy an id from the Supabase `products` table or from the current list page's network tab).
Expected: "Cargando producto..." briefly, then the form pre-filled with that product's data.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminRoot.tsx
git commit -m "Wire product create/edit routes"
```

---

### Task 5: Point `Products.tsx` at the new routes, remove the modal

**Files:**
- Modify: `src/pages/admin/views/Products.tsx`
- Delete: `src/pages/admin/modals/ProductModal.tsx`

**Interfaces:**
- Consumes: routes from Task 4 (`/admin/productos/nuevo`, `/admin/productos/:id`)
- Produces: nothing new (this is the final integration task — after this, `npm run build` must succeed and the list page must fully drive the new pages)

- [ ] **Step 1: Replace the `ProductModal` import with a router import**

In `src/pages/admin/views/Products.tsx`, change:

```tsx
import { ProductModal } from '../modals/ProductModal'
```

to:

```tsx
import { useNavigate } from 'react-router-dom'
```

- [ ] **Step 2: Remove modal state, add `navigate`**

Change:

```tsx
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<Producto | null>(null)
  const [viewMode, setViewMode]         = useState<'table' | 'grid'>('table')
  const sentinelRef                     = useRef<HTMLDivElement>(null)
```

to:

```tsx
  const [viewMode, setViewMode]         = useState<'table' | 'grid'>('table')
  const sentinelRef                     = useRef<HTMLDivElement>(null)
  const navigate                        = useNavigate()
```

- [ ] **Step 3: Point "Agregar producto" at the new route**

Change:

```tsx
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] transition-all duration-200 shadow-lg shadow-[#C41B2E]/25 cursor-pointer"
        >
```

to:

```tsx
        <button
          onClick={() => navigate('/admin/productos/nuevo')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] transition-all duration-200 shadow-lg shadow-[#C41B2E]/25 cursor-pointer"
        >
```

- [ ] **Step 4: Make table rows clickable, route buttons through the row's navigation**

Change:

```tsx
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F4]/50'
                    } hover:bg-[#F4F0E8]`}
                  >
```

to:

```tsx
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/admin/productos/${p.id}`)}
                    className={`transition-colors cursor-pointer ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F4]/50'
                    } hover:bg-[#F4F0E8]`}
                  >
```

Change the visibility toggle to stop the row click from also firing:

```tsx
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C41B2E]/20 ${
                          p.disponible ? 'bg-emerald-500' : 'bg-[#D8D0C6]'
                        }`}
                      >
```

to:

```tsx
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleDisponible(p) }}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C41B2E]/20 ${
                          p.disponible ? 'bg-emerald-500' : 'bg-[#D8D0C6]'
                        }`}
                      >
```

Change the edit and delete buttons:

```tsx
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true) }}
                          className="p-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1] rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-[#9E9080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
```

to:

```tsx
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/admin/productos/${p.id}`) }}
                          className="p-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#FFF0F1] rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(p) }}
                          className="p-1.5 text-[#9E9080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
```

- [ ] **Step 5: Remove the modal render**

Change:

```tsx
      <ProductModal
        producto={editing}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={async () => {
          setModalOpen(false)
          setEditing(null)
          await reloadAfterMutation()
        }}
      />
    </div>
    </>
  )
}
```

to:

```tsx
    </div>
    </>
  )
}
```

- [ ] **Step 6: Delete the modal file**

```bash
rm "src/pages/admin/modals/ProductModal.tsx"
```

- [ ] **Step 7: Type-check and build**

Run: `npx tsc -b --noEmit`
Expected: no errors (in particular, no "unused variable" errors for anything removed in Steps 1–2, and no leftover reference to `ProductModal`).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Verify the full flow in the browser**

Run: `npm run dev`, open `http://localhost:5173/admin/productos`, log in.

1. Click "Agregar producto" → lands on `/admin/productos/nuevo` with an empty form.
2. Fill Nombre, Código, Categoría (required fields) → go to the Imagen tab → drag an image file onto the drop zone → confirm the progress bar runs and a preview appears (this exercises Task 1 + Task 2 end-to-end for the first time).
3. Submit → toast "Producto creado" → redirected to `/admin/productos` → the new product appears in the table.
4. Click anywhere on that product's row → lands on `/admin/productos/:id` with the form pre-filled, including the uploaded image.
5. Change a field, submit → toast "Producto actualizado" → redirected back to the list, change reflected.
6. On the list, click the visibility toggle and the delete button directly (not the row) → confirm neither one navigates away, both behave as before (toggle flips in place / delete asks for confirmation and removes the row).

Expected: all six behaviors match. If step 2's upload fails with a 401/500, check that `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are set in the environment `npm run dev` is running against (Vercel dev / `vercel env pull`) — these are the same vars `api/products.ts` already depends on.

- [ ] **Step 9: Commit**

```bash
git add src/pages/admin/views/Products.tsx
git rm src/pages/admin/modals/ProductModal.tsx
git commit -m "Replace product modal with dedicated create/edit pages"
```

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-07-29-admin-product-form-design.md` maps to a task — routes (Task 4), listado navigation (Task 5), `ProductForm.tsx` (Task 3), `ImageUpload.tsx` (Task 2), `api/upload.ts` (Task 1), deletion of `ProductModal.tsx` (Task 5), Empero palette (used throughout Tasks 2–3), error handling (loadError/upload error/save error all implemented).
- **Type consistency:** `ImageUpload`'s `onChange(url, publicId)` signature (Task 2) matches exactly how `ProductForm.tsx` calls it (Task 3). `fromForm`/`toForm`/`schema` are identical to the ones already proven in `ProductModal.tsx`, just relocated — no field renamed.
- **No placeholders:** every step has literal, complete code — nothing marked TBD or "similar to above".
