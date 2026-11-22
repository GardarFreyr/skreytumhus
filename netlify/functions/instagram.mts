/**
 * GET /api/instagram          → nýjustu færslur @skreytum_hus (JSON)
 * GET /api/instagram/img/:id  → mynd færslunnar, úr okkar eigin geymslu
 * Sjá netlify/lib/instagram.mts.
 */
import { getStore } from '@netlify/blobs'
import { getFeed, type Store } from '../lib/instagram.mts'

export default async (req: Request) => {
  const store = getStore('instagram') as unknown as Store
  const url = new URL(req.url)
  const img = url.pathname.match(/^\/api\/instagram\/img\/([^/]+)$/)

  if (img) {
    const hit = await store.getWithMetadata(`img/${decodeURIComponent(img[1])}`, { type: 'arrayBuffer' })
    if (!hit) return new Response('Not found', { status: 404 })
    return new Response(hit.data, {
      headers: {
        'Content-Type': String(hit.metadata.contentType ?? 'image/jpeg'),
        // Mynd færslu breytist aldrei
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  }

  const feed = await getFeed(store, process.env.INSTAGRAM_ACCESS_TOKEN)
  return Response.json(feed, {
    headers: {
      // Vafri: 5 mín. Netlify CDN: 30 mín, og eldra svar má nota á meðan nýtt er sótt
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': feed.status === 'ok' ? 'public, s-maxage=1800, stale-while-revalidate=86400' : 'public, s-maxage=120',
    },
  })
}

export const config = { path: ['/api/instagram', '/api/instagram/img/:id'] }
