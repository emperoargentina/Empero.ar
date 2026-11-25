// api/consultas.ts
// Recibe el formulario de contacto: valida, guarda en Supabase (`consultas`)
// y avisa por email con Resend. Runtime Node.js (Fluid Compute), firma Web.
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const ALLOWED_ORIGINS = [
  'https://www.empero.com.ar',
  'https://empero.com.ar',
  'http://localhost:5173',
  'http://localhost:3000',
]

const MAX_PER_HOUR = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const consultaSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().max(254).regex(EMAIL_RE),
  telefono: z.string().trim().max(40).optional().default(''),
  empresa: z.string().trim().max(120).optional().default(''),
  mensaje: z.string().trim().min(10).max(5000),
  // Honeypot: campo invisible para humanos. Si viene con texto, es un bot.
  website: z.string().optional().default(''),
})

type Consulta = z.infer<typeof consultaSchema>

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmail(c: Consulta, id: string): { subject: string; html: string; text: string } {
  const rows: [string, string][] = [
    ['Nombre', c.nombre],
    ['Email', c.email],
    ['Teléfono', c.telefono || '—'],
    ['Empresa', c.empresa || '—'],
  ]

  const text = [
    'Nueva consulta desde empero.com.ar',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Mensaje:',
    c.mensaje,
    '',
    `ID: ${id}`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#F4F0E8;font-family:Arial,Helvetica,sans-serif;color:#1A1613">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #EBE5DC">
      <tr><td style="padding:24px 28px;border-bottom:3px solid #C41B2E">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C41B2E;font-weight:bold">Nueva consulta web</p>
        <h1 style="margin:6px 0 0;font-size:20px">${escapeHtml(c.nombre)}</h1>
      </td></tr>
      <tr><td style="padding:20px 28px">
        <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:6px 0;color:#6B6159;width:110px">${k}</td><td style="padding:6px 0;font-weight:bold">${escapeHtml(v)}</td></tr>`,
            )
            .join('')}
        </table>
        <p style="margin:18px 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6B6159">Mensaje</p>
        <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(c.mensaje)}</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #EBE5DC;font-size:12px;color:#9E9080">
        Respondé este email para contestarle directo a ${escapeHtml(c.email)}. También queda guardada en el panel: /admin/consultas
      </td></tr>
    </table>
  </body>
</html>`

  return { subject: `Nueva consulta web — ${c.nombre}`, html, text }
}

async function sendEmail(c: Consulta, id: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.warn('consultas: falta RESEND_API_KEY', { id })
    return false
  }

  const { subject, html, text } = buildEmail(c, id)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Evita mails duplicados si la función se reintenta con la misma consulta.
      'Idempotency-Key': `consulta-${id}`,
    },
    body: JSON.stringify({
      from: process.env.CONSULTAS_FROM_EMAIL?.trim() || 'Empero Web <onboarding@resend.dev>',
      to: [process.env.CONSULTAS_TO_EMAIL?.trim() || 'empero.argentina@gmail.com'],
      reply_to: c.email,
      subject,
      html,
      text,
    }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    console.error('consultas: Resend rechazó el aviso', { id, status: res.status, name: error?.name })
    return false
  }
  return true
}

export function OPTIONS(req: Request): Response {
  return new Response(null, { headers: corsHeaders(req) })
}

export async function POST(req: Request): Promise<Response> {
  const cors = corsHeaders(req)

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return json({ error: 'Server misconfigured' }, 500, cors)
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Formato inválido' }, 400, cors)
  }

  const parsed = consultaSchema.safeParse(payload)
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map(i => String(i.path[0])))]
    return json({ error: 'Datos inválidos', fields }, 422, cors)
  }

  const consulta = parsed.data
  // Bot: respondemos OK para no darle pistas, pero no guardamos nada.
  if (consulta.website) return json({ ok: true }, 200, cors)

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('consultas')
    .select('id', { count: 'exact', head: true })
    .eq('email', consulta.email)
    .gte('created_at', since)
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return json({ error: 'Demasiadas consultas seguidas. Probá de nuevo en un rato.' }, 429, cors)
  }

  const id = crypto.randomUUID()
  const { error: insertError } = await supabase.from('consultas').insert({
    id,
    nombre: consulta.nombre,
    email: consulta.email,
    telefono: consulta.telefono || null,
    empresa: consulta.empresa || null,
    mensaje: consulta.mensaje,
    origen: req.headers.get('Referer')?.slice(0, 300) ?? null,
    user_agent: req.headers.get('User-Agent')?.slice(0, 300) ?? null,
  })
  if (insertError) {
    console.error('consultas: error al guardar', insertError.message)
    return json({ error: 'No pudimos guardar tu consulta' }, 500, cors)
  }

  // Si el email falla, la consulta igual queda guardada en el panel.
  let emailSent = false
  try {
    emailSent = await sendEmail(consulta, id)
  } catch (err) {
    console.error('consultas: error al enviar email', err)
  }
  if (emailSent) {
    const { error } = await supabase.from('consultas').update({ email_enviado: true }).eq('id', id)
    if (error) console.error('consultas: no se pudo marcar el aviso como enviado', { id, code: error.code })
  }

  return json({ ok: true, id }, 201, cors)
}
