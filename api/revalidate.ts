// api/revalidate.ts
export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const secret = req.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Attempt Vercel CDN purge (non-fatal if VERCEL_TOKEN not set)
  const vercelToken = process.env.VERCEL_TOKEN
  if (vercelToken) {
    const origin = new URL(req.url).origin
    try {
      await fetch('https://api.vercel.com/v1/edge-cache/purge', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries: [`${origin}/api/products`] }),
      })
    } catch {
      // Non-fatal — cache expires naturally at s-maxage
    }
  }

  return new Response(
    JSON.stringify({ revalidated: true, timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
