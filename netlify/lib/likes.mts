/**
 * „Líkar við“ greinar – sameiginleg talning fyrir alla gesti, geymd í Netlify Blobs.
 *
 * WordPress-vefurinn hefur engin like-viðbót eða API (REST-nafnrými: wp/v2, akismet,
 * wordpress-popular-posts (bara flettingar), backwpup …), svo talningin er geymd hér.
 *
 * Auðkenni greinar er WordPress-ID færslunnar (stöðugt, breytist ekki þótt slóð breytist).
 * Hvert like er sérstök færsla `v/<postId>/<gestur>`; talan er fjöldi slíkra færslna. Því er
 * tvísmellur eða endurtekin beiðni frá sama gesti alltaf sama færslan – talan hækkar ekki.
 *
 * Gestur = handahófskennt auðkenni í HttpOnly-köku. Gegn misnotkun:
 *  - aðeins ID sem WordPress staðfestir að sé birt færsla eru tekin gild;
 *  - hámark á like á hverja IP-tölu (hashaða, aldrei geymd hrá) á hverja grein og á klst.
 */

export interface Store {
  get(key: string, opts: { type: 'json' }): Promise<unknown>
  setJSON(key: string, value: unknown): Promise<unknown>
  delete(key: string): Promise<unknown>
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>
}

export const WP_POST_URL = (id: number) => `https://www.skreytumhus.is/?rest_route=/wp/v2/posts/${id}&_fields=id,status`
/** Sami vafri/heimili (sama IP) má líka við sömu grein að hámarki svona oft (t.d. nokkrir á heimili) */
export const MAX_PER_IP_PER_POST = 6
/** Hámark breytinga (like/unlike) frá einni IP-tölu á klukkustund */
export const MAX_PER_IP_PER_HOUR = 60

export interface LikeState { postId: number; count: number; liked: boolean }

export class LikeError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function parsePostId(raw: string | undefined): number | null {
  if (!raw || !/^\d{1,9}$/.test(raw)) return null
  const n = Number(raw)
  return n > 0 ? n : null
}

/** Gestaauðkenni úr köku: aðeins okkar eigið snið er tekið gilt. */
export function isVisitorId(v: string | undefined | null): v is string {
  return !!v && /^[A-Za-z0-9_-]{22,64}$/.test(v)
}

export function newVisitorId() {
  const b = new Uint8Array(18)
  crypto.getRandomValues(b)
  return Buffer.from(b).toString('base64url')
}

async function sha(text: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Buffer.from(d).toString('base64url').slice(0, 32)
}

/** Leynilegt salt (búið til einu sinni og geymt) svo IP-hash verði ekki rakið til baka. */
async function salt(store: Store) {
  const s = (await store.get('salt', { type: 'json' })) as { v: string } | null
  if (s?.v) return s.v
  const v = newVisitorId() + newVisitorId()
  await store.setJSON('salt', { v })
  return v
}

async function countOf(store: Store, postId: number) {
  const c = (await store.get(`count/${postId}`, { type: 'json' })) as { n: number } | null
  return c?.n ?? 0
}

/** Telur like-færslurnar og vistar töluna (talan er því alltaf raunverulegur fjöldi). */
async function recount(store: Store, postId: number) {
  const { blobs } = await store.list({ prefix: `v/${postId}/` })
  const n = blobs.length
  await store.setJSON(`count/${postId}`, { n, at: Date.now() })
  return n
}

/** Staðfestir hjá WordPress að færslan sé til og birt. Niðurstaðan geymd svo þetta sé sjaldan gert. */
async function assertRealPost(store: Store, postId: number, fetchFn: typeof fetch) {
  const key = `post/${postId}`
  if ((await store.get(key, { type: 'json' })) as { ok: boolean } | null) return
  let ok = false
  try {
    const res = await fetchFn(WP_POST_URL(postId), { headers: { Accept: 'application/json' } })
    const body = res.ok ? ((await res.json()) as { id?: number; status?: string }) : null
    ok = body?.id === postId && (body.status === undefined || body.status === 'publish')
    if (!res.ok && res.status !== 404) throw new LikeError('wordpress-unavailable', 503)
  } catch (e) {
    if (e instanceof LikeError) throw e
    throw new LikeError('wordpress-unavailable', 503)
  }
  if (!ok) throw new LikeError('unknown-post', 404)
  await store.setJSON(key, { ok: true })
}

export async function getLikes(store: Store, postId: number, visitor: string | null): Promise<LikeState> {
  const [count, mine] = await Promise.all([
    countOf(store, postId),
    visitor ? store.get(`v/${postId}/${visitor}`, { type: 'json' }) : null,
  ])
  return { postId, count, liked: !!mine }
}

export async function setLike(
  store: Store,
  postId: number,
  visitor: string,
  like: boolean,
  ip: string,
  fetchFn: typeof fetch = fetch,
  now = Date.now(),
): Promise<LikeState> {
  const key = `v/${postId}/${visitor}`
  const existing = (await store.get(key, { type: 'json' })) as { ip: string } | null
  // Engin breyting (t.d. tvísmellur eða endurtekin beiðni): skilum stöðunni óbreyttri
  if (!!existing === like) return { postId, count: await countOf(store, postId), liked: like }

  const ipHash = await sha(`${await salt(store)}:${ip}`)
  const hourKey = `rl/${ipHash}/${Math.floor(now / 3_600_000)}`
  const hour = ((await store.get(hourKey, { type: 'json' })) as { n: number } | null)?.n ?? 0
  if (hour >= MAX_PER_IP_PER_HOUR) throw new LikeError('rate-limited', 429)

  if (like) {
    await assertRealPost(store, postId, fetchFn)
    const ipKey = `ip/${postId}/${ipHash}`
    const perIp = ((await store.get(ipKey, { type: 'json' })) as { n: number } | null)?.n ?? 0
    if (perIp >= MAX_PER_IP_PER_POST) throw new LikeError('rate-limited', 429)
    await store.setJSON(key, { ip: ipHash, at: now })
    await store.setJSON(ipKey, { n: perIp + 1 })
  } else {
    await store.delete(key)
    const ipKey = `ip/${postId}/${existing!.ip}`
    const perIp = ((await store.get(ipKey, { type: 'json' })) as { n: number } | null)?.n ?? 0
    if (perIp > 0) await store.setJSON(ipKey, { n: perIp - 1 })
  }
  await store.setJSON(hourKey, { n: hour + 1 })
  return { postId, count: await recount(store, postId), liked: like }
}
