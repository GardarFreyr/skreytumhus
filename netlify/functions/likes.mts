/**
 * GET  /api/likes/:postId  → { postId, count, liked }
 * POST /api/likes/:postId  { liked: true|false } → sama svar eftir breytingu
 * Sjá netlify/lib/likes.mts.
 */
import { getStore } from '@netlify/blobs'
import { getLikes, isVisitorId, LikeError, newVisitorId, parsePostId, setLike, type Store } from '../lib/likes.mts'

/** Það sem Netlify sendir fallinu (sjá docs: Functions API, Context) */
interface Context { params: Record<string, string | undefined>; ip: string }

const COOKIE = 'sh_v'
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } })

function readCookie(req: Request) {
  const m = (req.headers.get('cookie') ?? '').match(/(?:^|;\s*)sh_v=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

export default async (req: Request, context: Context) => {
  const postId = parsePostId(context.params.postId)
  if (!postId) return json({ error: 'bad-id' }, 400)
  const store = getStore({ name: 'likes', consistency: 'strong' }) as unknown as Store
  const cookie = readCookie(req)
  const visitor = isVisitorId(cookie) ? cookie : null

  if (req.method === 'GET') return json(await getLikes(store, postId, visitor))
  if (req.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'GET, POST' })

  // Aðeins frá vefnum sjálfum (ekki aðrar síður sem senda beiðnir fyrir hönd gesta)
  const origin = req.headers.get('origin')
  if (!origin || new URL(origin).host !== new URL(req.url).host) return json({ error: 'origin' }, 403)

  let liked: unknown
  try {
    liked = ((await req.json()) as { liked?: unknown }).liked
  } catch {
    return json({ error: 'bad-body' }, 400)
  }
  if (typeof liked !== 'boolean') return json({ error: 'bad-body' }, 400)

  const id = visitor ?? newVisitorId()
  const setCookie: Record<string, string> = visitor ? {} : { 'Set-Cookie': `${COOKIE}=${id}; Path=/api/likes; Max-Age=63072000; HttpOnly; Secure; SameSite=Lax` }
  try {
    return json(await setLike(store, postId, id, liked, context.ip || 'unknown'), 200, setCookie)
  } catch (e) {
    if (e instanceof LikeError) return json({ error: e.message }, e.status, setCookie)
    throw e
  }
}

export const config = { path: '/api/likes/:postId' }
