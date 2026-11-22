/**
 * Instagram-straumur @skreytum_hus í gegnum opinbert API Meta
 * („Instagram API with Instagram Login“, graph.instagram.com). Keyrir eingöngu á þjóni
 * (Netlify Functions) – aðgangslykillinn fer aldrei í vafrann.
 *
 * - Lykill: INSTAGRAM_ACCESS_TOKEN (umhverfisbreyta í Netlify). Langtímalyklar gilda í 60 daga;
 *   hér eru þeir endurnýjaðir sjálfkrafa (refresh_access_token) þegar þeir eru eldri en 7 daga,
 *   og nýi lykillinn geymdur í Netlify Blobs.
 * - Skyndiminni: síðasti vel heppnaði straumur og myndirnar sjálfar eru geymd í Netlify Blobs.
 *   Myndslóðir Instagram renna út, svo myndirnar eru afritaðar og birtar héðan.
 * - Ef Instagram svarar ekki eða lykill rennur út: síðasti góði straumur er sýndur áfram
 *   (status „stale“). Engar færslur eru nokkru sinni búnar til.
 */

export const PROFILE_URL = 'https://www.instagram.com/skreytum_hus/'
const GRAPH = 'https://graph.instagram.com'
const FIELDS = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp'
export const POST_COUNT = 6
/** Hve lengi straumur telst ferskur áður en sótt er aftur */
export const FRESH_MS = 30 * 60 * 1000
const TOKEN_REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export interface Store {
  get(key: string, opts: { type: 'json' }): Promise<unknown>
  get(key: string, opts: { type: 'arrayBuffer' }): Promise<ArrayBuffer | null>
  getWithMetadata(key: string, opts: { type: 'arrayBuffer' }): Promise<{ data: ArrayBuffer; metadata: Record<string, unknown> } | null>
  setJSON(key: string, value: unknown): Promise<unknown>
  set(key: string, value: ArrayBuffer, opts?: { metadata?: Record<string, unknown> }): Promise<unknown>
}

export interface Post {
  id: string
  permalink: string
  caption: string
  timestamp: string
  type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  image: string
}

export interface Feed {
  status: 'ok' | 'stale' | 'not-connected' | 'error'
  profileUrl: string
  posts: Post[]
  fetchedAt?: string
  /** Ástæða (ef ekki „ok“) – til greiningar, aldrei lykill eða leyndarmál */
  reason?: string
}

interface TokenRecord { token: string; refreshedAt: number }
interface CachedFeed { posts: Post[]; fetchedAt: number }
interface GraphMedia { id: string; media_type: Post['type']; media_url?: string; thumbnail_url?: string; permalink: string; caption?: string; timestamp: string }

export class InstagramError extends Error {
  code?: number
  expired: boolean
  constructor(message: string, code?: number, expired = false) {
    super(message)
    this.code = code
    this.expired = expired
  }
}

async function graph<T>(fetchFn: typeof fetch, path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(GRAPH + path)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetchFn(url, { headers: { Accept: 'application/json' } })
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number; error_subcode?: number } } & T
  if (!res.ok || body.error) {
    const code = body.error?.code
    // 190 = ógildur eða útrunninn lykill
    throw new InstagramError(body.error?.message ?? `Instagram svaraði ${res.status}`, code, code === 190)
  }
  return body
}

/** Lykill: sá nýjasti úr Blobs (eftir endurnýjun), annars úr umhverfisbreytu. */
async function currentToken(store: Store, envToken: string | undefined): Promise<TokenRecord | null> {
  const saved = (await store.get('token', { type: 'json' })) as TokenRecord | null
  if (saved?.token) return saved
  return envToken ? { token: envToken, refreshedAt: 0 } : null
}

/** Endurnýjar langtímalykil (gildir þá aftur í 60 daga). Kostar ekkert og krefst ekki app-leyndarmáls. */
export async function refreshTokenIfDue(store: Store, envToken: string | undefined, fetchFn: typeof fetch, now = Date.now()) {
  const rec = await currentToken(store, envToken)
  if (!rec || now - rec.refreshedAt < TOKEN_REFRESH_AFTER_MS) return rec
  try {
    const r = await graph<{ access_token: string; expires_in: number }>(fetchFn, '/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: rec.token })
    const next = { token: r.access_token, refreshedAt: now }
    await store.setJSON('token', next)
    return next
  } catch {
    // Mistókst (t.d. lykill nýr, < 24 klst): höldum áfram með núverandi lykil
    return rec
  }
}

/** Sækir nýjustu færslurnar frá Instagram og geymir þær og myndirnar. */
export async function updateFeed(store: Store, envToken: string | undefined, fetchFn: typeof fetch = fetch, now = Date.now()): Promise<CachedFeed> {
  const rec = await refreshTokenIfDue(store, envToken, fetchFn, now)
  if (!rec) throw new InstagramError('not-connected')
  const { data } = await graph<{ data: GraphMedia[] }>(fetchFn, '/me/media', { fields: FIELDS, limit: String(POST_COUNT + 4), access_token: rec.token })

  const posts: Post[] = []
  for (const m of data) {
    if (posts.length >= POST_COUNT) break
    const src = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url
    if (!src) continue // t.d. myndband án smámyndar: sleppt frekar en að giska
    const img = await fetchFn(src)
    if (!img.ok) continue
    await store.set(`img/${m.id}`, await img.arrayBuffer(), { metadata: { contentType: img.headers.get('content-type') ?? 'image/jpeg' } })
    posts.push({ id: m.id, permalink: m.permalink, caption: (m.caption ?? '').slice(0, 300), timestamp: m.timestamp, type: m.media_type, image: `/api/instagram/img/${encodeURIComponent(m.id)}` })
  }
  const cached = { posts, fetchedAt: now }
  await store.setJSON('feed', cached)
  return cached
}

/** Svar fyrir vefinn: ferskur straumur ef hægt er, annars síðasti góði straumur. */
export async function getFeed(store: Store, envToken: string | undefined, fetchFn: typeof fetch = fetch, now = Date.now()): Promise<Feed> {
  const cached = (await store.get('feed', { type: 'json' })) as CachedFeed | null
  const asFeed = (c: CachedFeed, status: Feed['status'], reason?: string): Feed => ({ status, profileUrl: PROFILE_URL, posts: c.posts, fetchedAt: new Date(c.fetchedAt).toISOString(), reason })

  if (cached && now - cached.fetchedAt < FRESH_MS) return asFeed(cached, 'ok')
  try {
    return asFeed(await updateFeed(store, envToken, fetchFn, now), 'ok')
  } catch (e) {
    const err = e as InstagramError
    const reason = err.message === 'not-connected' ? 'not-connected' : err.expired ? 'token-expired' : 'instagram-unavailable'
    if (cached?.posts.length) return asFeed(cached, 'stale', reason)
    return { status: reason === 'not-connected' ? 'not-connected' : 'error', profileUrl: PROFILE_URL, posts: [], reason }
  }
}
