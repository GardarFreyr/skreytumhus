/**
 * Vafrapróf: like-hnappur og „Fara efst“.
 *
 *  BASE_URL=https://skreytumhus.netlify.app npm run check:likes   → raunverulegt API (like eru tekin til baka í lokin)
 *  npm run check:likes                                             → staðbundið (vite preview); API líkt eftir í prófinu
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const LIVE = !/localhost|127\.0\.0\.1/.test(BASE)
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ARTICLE = process.env.ARTICLE ?? '/p/96003'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let failures = 0
const ok = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { failures++; console.log('  ✗ ' + msg) } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Staðbundið: einfaldur gervi-þjónn með sameiginlegri talningu (eins og Netlify-fallið)
const server = { likes: new Map() }
let posts = 0
async function mock(page, visitor) {
  if (LIVE) return
  await page.setRequestInterception(true)
  page.on('request', async (req) => {
    const m = new URL(req.url()).pathname.match(/^\/api\/likes\/(\d+)$/)
    if (!m) return req.continue()
    const set = server.likes.get(m[1]) ?? new Set()
    server.likes.set(m[1], set)
    if (req.method() === 'POST') {
      posts++
      await sleep(250)
      JSON.parse(req.postData()).liked ? set.add(visitor) : set.delete(visitor)
    }
    req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: set.size, liked: set.has(visitor) }) })
  })
}

async function openArticle(ctx, visitor, width = 1440) {
  const page = await ctx.newPage()
  await page.setViewport({ width, height: 900 })
  page.posts = 0
  page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/api/likes/')) page.posts++ })
  await mock(page, visitor)
  await page.goto(BASE + ARTICLE, { waitUntil: 'networkidle2', timeout: 60000 })
  await page.waitForSelector('footer button[aria-pressed]', { timeout: 30000 })
  return page
}
const state = (page) => page.evaluate(() => [...document.querySelectorAll('article button[aria-pressed]')].map((b) => ({
  pressed: b.getAttribute('aria-pressed') === 'true',
  count: Number(b.querySelector('.tabular-nums').textContent.replace(/\D/g, '')),
  label: b.getAttribute('aria-label'),
})))
const clickLike = (page, times = 1) => page.evaluate((n) => { const b = document.querySelector('article footer button[aria-pressed]'); for (let i = 0; i < n; i++) b.click() }, times)
const settle = (page) => page.waitForFunction(() => !document.querySelector('article button[aria-busy="true"]'), { timeout: 15000 })

try {
  console.log(`Like-hnappur (${LIVE ? 'raunverulegt API' : 'líkt eftir API'}) – ${BASE + ARTICLE}`)
  const ctxA = await browser.createBrowserContext()
  const ctxB = await browser.createBrowserContext()
  let a = await openArticle(ctxA, 'A')
  const s0 = await state(a)
  ok(s0.length === 2 && s0[0].count === s0[1].count, `tveir hnappar (haus og lok) sýna sömu tölu: ${s0[0]?.count}`)
  ok(s0.every((x) => /Líka við greinina|Þér líkar/.test(x.label)), `aðgengilegur merkimiði: „${s0[0]?.label}“`)
  const start = s0[0].count
  const wasLiked = s0[0].pressed
  if (wasLiked) { await clickLike(a); await settle(a) }
  const base = (await state(a))[0].count

  await clickLike(a)
  const instant = await state(a)
  ok(instant[0].pressed && instant[0].count === base + 1, `strax svörun við smell: ${base} → ${instant[0].count}`)
  await settle(a)
  ok((await state(a))[0].count === base + 1, 'þjónninn staðfestir töluna')

  await a.reload({ waitUntil: 'networkidle2' })
  await a.waitForSelector('footer button[aria-pressed]')
  const afterReload = (await state(a))[0]
  ok(afterReload.pressed && afterReload.count === base + 1, `helst eftir endurhleðslu: ${afterReload.count}, líkað=${afterReload.pressed}`)

  const b = await openArticle(ctxB, 'B', 390)
  const sb = (await state(b))[0]
  ok(sb.count === base + 1 && !sb.pressed, `annar vafri (390 px) sér sömu tölu ${sb.count}, ekki merkt sem líkað`)

  b.posts = 0
  await clickLike(b, 2) // tvísmellur
  await settle(b)
  await sleep(500)
  const sb2 = (await state(b))[0]
  ok(b.posts === 1 && sb2.pressed && sb2.count === base + 2, `tvísmellur sendir eina beiðni (${b.posts}) og hækkar um 1: ${sb2.count}`)

  if (LIVE) {
    // Endurteknar beiðnir beint á API með sömu köku: talan má ekki hækka
    const r = await b.evaluate(async (id) => {
      const out = []
      for (let i = 0; i < 4; i++) out.push(await fetch(`/api/likes/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liked: true }) }).then((x) => x.json()))
      return out.map((x) => x.count)
    }, await b.evaluate(() => location.pathname.match(/\d+/)?.[0] ?? null) ?? 96003)
    ok(r.every((c) => c === base + 2), `4 endurteknar beiðnir: talan helst ${r.join(', ')}`)
    const foreign = await b.evaluate(async () => (await fetch('/api/likes/1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liked: true }) })).status)
    ok(foreign === 404, `ID sem er ekki WordPress-færsla er hafnað (${foreign})`)
  }

  await a.reload({ waitUntil: 'networkidle2' })
  await a.waitForSelector('footer button[aria-pressed]')
  ok((await state(a))[0].count === base + 2, 'fyrri vafrinn sér like frá hinum eftir endurhleðslu')

  // Taka prófun til baka svo raunveruleg tala verði eins og hún var
  await clickLike(a); await settle(a)
  await clickLike(b); await settle(b)
  if (wasLiked) { await clickLike(a); await settle(a) }
  await a.reload({ waitUntil: 'networkidle2' })
  await a.waitForSelector('footer button[aria-pressed]')
  ok((await state(a))[0].count === start, `prófun tekin til baka: talan aftur ${start}`)
  await ctxA.close(); await ctxB.close()

  console.log('Fara efst:')
  for (const [w, h] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h })
    await mock(page, 'C')
    await page.goto(BASE + ARTICLE, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.waitForSelector('button[aria-label="Fara efst"]')
    const vis = () => page.evaluate(() => getComputedStyle(document.querySelector('button[aria-label="Fara efst"]')).opacity === '1')
    await sleep(400)
    const atTop = await vis()
    await page.evaluate(() => window.scrollTo(0, 300)); await sleep(500)
    const at300 = await vis()
    await page.evaluate(() => window.scrollTo(0, 900)); await sleep(500)
    const at900 = await vis()
    // Skrunar alla síðuna: hnappurinn má aldrei sjást ofan á auglýsingu
    const covered = await page.evaluate(async () => {
      const btn = document.querySelector('button[aria-label="Fara efst"]')
      const hits = []
      for (let y = 600; y < document.documentElement.scrollHeight; y += 120) {
        window.scrollTo(0, y)
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        await new Promise((r) => setTimeout(r, 30))
        if (btn.dataset.visible !== 'true') continue
        const b = btn.getBoundingClientRect()
        for (const f of document.querySelectorAll('aside[aria-label="Auglýsingar"] figure')) {
          const r = f.getBoundingClientRect()
          if (b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top) hits.push(y)
        }
      }
      return hits
    })
    await page.evaluate(() => window.scrollTo(0, 2000)); await sleep(500)
    await page.click('button[aria-label="Fara efst"]')
    await sleep(1600)
    const y = await page.evaluate(() => window.scrollY)
    const hidden = !(await vis())
    ok(!atTop && !at300 && at900 && covered.length === 0 && y === 0 && hidden,
      `${w}px: falinn efst/300px=${!atTop && !at300}, sýnilegur 900px=${at900}, hylur aldrei auglýsingu=${covered.length === 0}, fer efst=${y === 0}`)
    if (w === 390) {
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.evaluate(() => window.scrollTo(0, 2500)); await sleep(500)
      await page.click('button[aria-label="Fara efst"]')
      const yNow = await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(window.scrollY))))
      ok(yNow === 0, `minni hreyfing (reduced motion): stekkur beint efst (${yNow})`)
    }
    await page.close()
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Allt stóðst')
process.exit(failures ? 1 : 0)
