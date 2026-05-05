// api/products.ts
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('nombre')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600',
      ...cors,
    },
  })
}
