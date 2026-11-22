/**
 * Prófar like-rökin (netlify/lib/likes.mts) með gervi-geymslu og gervi-WordPress.
 * Keyrsla: npm run test:likes
 */
import assert from 'node:assert/strict'
import { getLikes, setLike, parsePostId, MAX_PER_IP_PER_POST, MAX_PER_IP_PER_HOUR, LikeError, type Store } from '../netlify/lib/likes.mts'

function memStore(): Store & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>()
  return {
    data,
    async get(k: string) { return data.has(k) ? JSON.parse(JSON.stringify(data.get(k))) : null },
    async setJSON(k: string, v: unknown) { data.set(k, JSON.parse(JSON.stringify(v))) },
    async delete(k: string) { data.delete(k) },
    async list({ prefix }: { prefix: string }) { return { blobs: [...data.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) } },
  } as Store & { data: Map<string, unknown> }
}
let wpCalls = 0
const wp = (async (u: string | URL) => {
  wpCalls++
  const id = Number(new URL(String(u)).searchParams.get('rest_route')!.split('/').pop())
  return id === 404 ? Response.json({ code: 'rest_post_invalid_id' }, { status: 404 }) : Response.json({ id, status: 'publish' })
}) as typeof fetch
const rejects = async (p: Promise<unknown>, status: number) => {
  await assert.rejects(p, (e) => e instanceof LikeError && e.status === status)
}

const s = memStore()
let n = 0
const t = async (name: string, fn: () => Promise<void>) => { await fn(); n++; console.log('  ✓ ' + name) }

await t('engin like í byrjun – talan er 0, ekki búin til', async () => {
  assert.deepEqual(await getLikes(s, 96003, null), { postId: 96003, count: 0, liked: false })
})
await t('like hækkar töluna og er geymt fyrir gestinn', async () => {
  assert.deepEqual(await setLike(s, 96003, 'gestur-A-aaaaaaaaaaaaaaaa', true, '1.1.1.1', wp), { postId: 96003, count: 1, liked: true })
  assert.deepEqual(await getLikes(s, 96003, 'gestur-A-aaaaaaaaaaaaaaaa'), { postId: 96003, count: 1, liked: true })
})
await t('annar gestur (annar vafri) sér sömu tölu', async () => {
  assert.deepEqual(await getLikes(s, 96003, 'gestur-B-bbbbbbbbbbbbbbbb'), { postId: 96003, count: 1, liked: false })
  assert.equal((await setLike(s, 96003, 'gestur-B-bbbbbbbbbbbbbbbb', true, '2.2.2.2', wp)).count, 2)
})
await t('tvísmellur / endurteknar beiðnir hækka ekki töluna', async () => {
  const r = await Promise.all(Array.from({ length: 5 }, () => setLike(s, 96003, 'gestur-A-aaaaaaaaaaaaaaaa', true, '1.1.1.1', wp)))
  assert.ok(r.every((x) => x.count === 2 && x.liked))
  assert.equal((await getLikes(s, 96003, null)).count, 2)
})
await t('hætta við like lækkar töluna, og aftur er óbreytt', async () => {
  assert.equal((await setLike(s, 96003, 'gestur-B-bbbbbbbbbbbbbbbb', false, '2.2.2.2', wp)).count, 1)
  assert.equal((await setLike(s, 96003, 'gestur-B-bbbbbbbbbbbbbbbb', false, '2.2.2.2', wp)).count, 1)
})
await t('greinar eru taldar sér', async () => {
  assert.equal((await getLikes(s, 95235, 'gestur-A-aaaaaaaaaaaaaaaa')).count, 0)
})
await t('aðeins raunverulegar WordPress-færslur – og WordPress spurt einu sinni', async () => {
  await rejects(setLike(s, 404, 'gestur-A-aaaaaaaaaaaaaaaa', true, '1.1.1.1', wp), 404)
  const before = wpCalls
  await setLike(s, 95235, 'gestur-C-cccccccccccccccc', true, '3.3.3.3', wp)
  await setLike(s, 95235, 'gestur-D-dddddddddddddddd', true, '4.4.4.4', wp)
  assert.equal(wpCalls - before, 1)
})
await t(`ný kaka í sífellu frá sömu IP: hámark ${MAX_PER_IP_PER_POST} á grein`, async () => {
  for (let i = 0; i < MAX_PER_IP_PER_POST; i++) await setLike(s, 1234, `vélmenni-${i}-xxxxxxxxxxxxxxx`, true, '6.6.6.6', wp)
  await rejects(setLike(s, 1234, 'vélmenni-X-xxxxxxxxxxxxxxx', true, '6.6.6.6', wp), 429)
  assert.equal((await getLikes(s, 1234, null)).count, MAX_PER_IP_PER_POST)
})
await t(`hámark ${MAX_PER_IP_PER_HOUR} breytingar á klst. frá einni IP`, async () => {
  const now = Date.UTC(2026, 10, 22, 12)
  for (let i = 0; i < MAX_PER_IP_PER_HOUR; i++) await setLike(s, 5000 + i, 'gestur-E-eeeeeeeeeeeeeeee', true, '7.7.7.7', wp, now)
  await rejects(setLike(s, 6000, 'gestur-E-eeeeeeeeeeeeeeee', true, '7.7.7.7', wp, now), 429)
  await setLike(s, 6000, 'gestur-E-eeeeeeeeeeeeeeee', true, '7.7.7.7', wp, now + 3_600_000) // næsta klst.
})
await t('IP-tölur eru aldrei geymdar hráar', async () => {
  const dump = JSON.stringify([...s.data.entries()])
  assert.ok(!/\d+\.\d+\.\d+\.\d+/.test(dump))
})
await t('ógild auðkenni hafnað', async () => {
  for (const bad of ['', 'abc', '-1', '0', '1e5', '12345678901']) assert.equal(parsePostId(bad), null)
  assert.equal(parsePostId('96003'), 96003)
})
console.log(`\n✓ ${n} próf stóðust`)
