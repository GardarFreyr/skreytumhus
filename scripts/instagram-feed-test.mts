/**
 * Prófar Instagram-rökin (netlify/lib/instagram.mts) með gervi-geymslu og gervi-API.
 * Engin raunveruleg köll eru gerð. Keyrsla: npm run test:instagram
 */
import assert from 'node:assert/strict'
import { getFeed, updateFeed, refreshTokenIfDue, FRESH_MS, type Store } from '../netlify/lib/instagram.mts'

function memStore(): Store & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>()
  return {
    data,
    async get(key: string) { return (data.get(key) as { v: unknown } | undefined)?.v ?? null },
    async getWithMetadata(key: string) { const e = data.get(key) as { v: ArrayBuffer; m: Record<string, unknown> } | undefined; return e ? { data: e.v, metadata: e.m } : null },
    async setJSON(key: string, v: unknown) { data.set(key, { v: JSON.parse(JSON.stringify(v)) }) },
    async set(key: string, v: ArrayBuffer, o?: { metadata?: Record<string, unknown> }) { data.set(key, { v, m: o?.metadata ?? {} }) },
  } as Store & { data: Map<string, unknown> }
}

type Mode = 'ok' | 'expired' | 'down'
function fakeApi(mode: () => Mode, calls: string[]) {
  return (async (input: string | URL) => {
    const u = new URL(String(input))
    calls.push(u.pathname)
    if (u.hostname === 'cdn.example') return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/jpeg' } })
    const m = mode()
    if (m === 'down') return new Response('bad gateway', { status: 502 })
    if (m === 'expired') return Response.json({ error: { message: 'Error validating access token: Session has expired', code: 190 } }, { status: 400 })
    if (u.pathname === '/refresh_access_token') return Response.json({ access_token: 'NEW', expires_in: 5184000 })
    assert.equal(u.searchParams.get('access_token') !== null, true)
    const data = Array.from({ length: 8 }, (_, i) => ({
      id: `m${i}`, media_type: i === 2 ? 'VIDEO' : 'IMAGE', permalink: `https://www.instagram.com/p/X${i}/`,
      media_url: `https://cdn.example/${i}.jpg`, thumbnail_url: i === 2 ? 'https://cdn.example/t2.jpg' : undefined,
      caption: `Færsla ${i}`, timestamp: `2026-11-${20 - i}T10:00:00+0000`,
    }))
    return Response.json({ data })
  }) as typeof fetch
}

let mode: Mode = 'ok'
const calls: string[] = []
const api = fakeApi(() => mode, calls)
const t0 = Date.parse('2026-11-22T12:00:00Z')

// 1. Enginn lykill → not-connected, engar færslur búnar til
{
  const f = await getFeed(memStore(), undefined, api, t0)
  assert.equal(f.status, 'not-connected'); assert.equal(f.posts.length, 0)
  console.log('✓ án lykils: not-connected, engar færslur')
}

const store = memStore()
// 2. Góður lykill → 6 nýjustu, í réttri röð, myndir geymdar og birtar héðan
{
  const f = await getFeed(store, 'TOKEN', api, t0)
  assert.equal(f.status, 'ok'); assert.equal(f.posts.length, 6)
  assert.deepEqual(f.posts.map((p) => p.id), ['m0', 'm1', 'm2', 'm3', 'm4', 'm5'])
  assert.equal(f.posts[0].permalink, 'https://www.instagram.com/p/X0/')
  assert.equal(f.posts[0].image, '/api/instagram/img/m0')
  assert.ok(store.data.has('img/m2'), 'myndband: smámynd geymd')
  console.log('✓ 6 nýjustu færslur, upprunaleg röð, myndir afritaðar, tenglar á upprunalegu færslurnar')
}
// 3. Innan 30 mín: úr skyndiminni, ekkert kall
{
  const before = calls.length
  const f = await getFeed(store, 'TOKEN', api, t0 + FRESH_MS - 1000)
  assert.equal(f.status, 'ok'); assert.equal(calls.length, before)
  console.log('✓ skyndiminni: ekkert kall til Instagram innan 30 mín.')
}
// 4. Instagram niðri → síðasti góði straumur (stale)
{
  mode = 'down'
  const f = await getFeed(store, 'TOKEN', api, t0 + FRESH_MS + 1000)
  assert.equal(f.status, 'stale'); assert.equal(f.reason, 'instagram-unavailable'); assert.equal(f.posts.length, 6)
  console.log('✓ Instagram niðri: síðasti góði straumur sýndur (stale)')
}
// 5. Útrunninn lykill → síðasti góði straumur, ástæða skráð
{
  mode = 'expired'
  const f = await getFeed(store, 'TOKEN', api, t0 + 2 * FRESH_MS)
  assert.equal(f.status, 'stale'); assert.equal(f.reason, 'token-expired'); assert.equal(f.posts.length, 6)
  console.log('✓ útrunninn lykill: síðasti góði straumur sýndur, reason=token-expired')
}
// 6. Útrunninn lykill og ekkert í minni → error, engar færslur
{
  const f = await getFeed(memStore(), 'TOKEN', api, t0)
  assert.equal(f.status, 'error'); assert.equal(f.posts.length, 0)
  console.log('✓ útrunninn lykill án skyndiminnis: error, engar gervifærslur')
}
// 7. Endurnýjun lykils eftir 7 daga; nýi lykillinn notaður
{
  mode = 'ok'
  const s = memStore()
  const rec = await refreshTokenIfDue(s, 'TOKEN', api, t0)
  assert.equal(rec?.token, 'NEW')
  const again = await refreshTokenIfDue(s, 'TOKEN', api, t0 + 1000)
  assert.equal(again?.token, 'NEW')
  await updateFeed(s, 'TOKEN', api, t0 + 2000)
  console.log('✓ lykill endurnýjaður sjálfkrafa og geymdur; nýr lykill notaður áfram')
}
console.log('\n✓ Instagram-rökin standast öll próf')
