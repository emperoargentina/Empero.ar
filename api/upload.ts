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
