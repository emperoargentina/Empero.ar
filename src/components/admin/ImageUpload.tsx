// src/components/admin/ImageUpload.tsx
import { useRef, useState, useCallback, useEffect } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  url: string | null
  publicId: string | null
  onChange: (url: string | null, publicId: string | null) => void
  size?: 'md' | 'lg'
  disabled?: boolean
  className?: string
}

// 'md' se dimensiona por ancho (tarjetas angostas); 'lg' se dimensiona por
// alto relativo al viewport, para llenar bien la pantalla sin forzar scroll
// en pantallas más chicas.
const SIZE_CLS = {
  md: 'w-[220px] aspect-square',
  lg: 'h-[54vh] max-h-[520px] min-h-[280px] aspect-square',
}

const MAX_MB = 10
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
const MAX_DIMENSION = 1600
const WEBP_QUALITY = 0.85

// Redimensiona y convierte a WebP en el navegador antes de subir — el archivo
// que viaja a Cloudinary ya llega liviano y optimizado. Se dejan intactos los
// GIF (podrían ser animados) y los SVG (vectores, no rasterizar).
async function toOptimizedWebp(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
  if (!blob) return file

  const newName = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], newName, { type: 'image/webp' })
}

export function ImageUpload({ url, publicId, onChange, size = 'md', disabled = false, className = '' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const upload = useCallback(async (file: File) => {
    setError('')
    setUploading(true)
    setProgress(0)

    let optimized: File
    try {
      optimized = await toOptimizedWebp(file)
    } catch {
      optimized = file
    }

    if (optimized.size > MAX_MB * 1024 * 1024) {
      setError(`Archivo demasiado grande (máx ${MAX_MB}MB)`)
      setUploading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setError('Sesión expirada, volvé a iniciar sesión')
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', optimized)

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

  // Pegar imagen con Ctrl+V mientras no haya una ya cargada.
  useEffect(() => {
    if (url || disabled) return
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) { e.preventDefault(); handleFile(file) }
          break
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, disabled])

  return (
    <div className={className}>
      {url ? (
        <div className="w-fit mx-auto rounded-xl overflow-hidden border border-[#EBE5DC] bg-[#FAF8F4]">
          <div className={`relative ${SIZE_CLS[size]}`}>
            <img src={url} alt="preview" className="w-full h-full object-cover block" />
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(null, null)}
                className="absolute top-2 right-2 rounded-full p-1.5 bg-black/60 hover:bg-black/75 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
          {publicId && (
            <p className="px-3 py-2 text-[11px] font-mono text-[#9E9080] truncate border-t border-[#EBE5DC] bg-white">
              {publicId}
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={e => { if (disabled) return; e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={disabled ? undefined : handleDrop}
          className={`flex flex-col items-center justify-center gap-2 mx-auto rounded-xl border-2 border-dashed transition-colors p-3 text-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${SIZE_CLS[size]}`}
          style={{
            borderColor: dragging ? '#C41B2E' : '#EBE5DC',
            background: dragging ? 'rgba(196,27,46,0.04)' : '#FAF8F4',
          }}
        >
          <ImageIcon className="w-6 h-6 text-[#C0B5A8]" />
          <p className="text-sm text-[#9E9080]">Arrastrá, pegá (Ctrl+V) o hacé click para subir</p>
          <p className="text-xs text-[#C0B5A8]">JPG, PNG, WebP — máx {MAX_MB}MB · se optimiza automático a WebP</p>
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
