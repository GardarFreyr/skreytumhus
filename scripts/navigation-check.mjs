/**
 * Vafrapróf: fljótandi „Fara efst“ og „Fyrri grein / Næsta grein“.
 * Keyrsla: npm run check:nav  (BASE_URL=https://skreytumhus.netlify.app fyrir lifandi vef)
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const WP = 'https://www.skreytumhus.is/?rest_route=/wp/v2/posts'
const SHOTS = process.env.SHOTS
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let failures = 0
const ok = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { failures++; console.log('  ✗ ' + msg) } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const wp = async (q) => (await fetch(`${WP}&_fields=id,slug,date,title&${q}`)).json()
const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')

async function open(path, width = 1440, height = 900) {
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(e.message))
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 60000 })
  return page
}
const navLinks = (page) => page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Fleiri greinar"]')
  if (!nav) return null
  return [...nav.querySelectorAll('a')].map((a) => ({ rel: a.rel, href: new URL(a.href).pathname, label: a.querySelector('.eyebrow').textContent.trim(), title: a.querySelector('.font-display').textContent.trim(), img: !!a.querySelector('img') }))
})
const waitNav = (page) => page.waitForFunction(() => { const n = document.querySelector('nav[aria-label="Fleiri greinar"]'); return n && !n.getAttribute('aria-busy') }, { timeout: 30000 })

try {
  console.log('Fyrri / næsta grein:')
  // Viðmið: beint úr WordPress
  const [mid] = await wp('per_page=1&offset=40&orderby=date&order=desc')
  const [older] = await wp(`per_page=1&before=${mid.date}&orderby=date&order=desc`)
  const [newer] = await wp(`per_page=1&after=${mid.date}&orderby=date&order=asc`)
  const enc = (slug) => `/greinar/${slug}`
  let page = await open(enc(mid.slug))
  await waitNav(page)
  let links = await navLinks(page)
  const p = links.find((l) => l.rel === 'prev'), n = links.find((l) => l.rel === 'next')
  ok(p?.href === enc(older.slug) && p.title === decode(older.title.rendered) && /Fyrri grein/.test(p.label), `„${decode(mid.title.rendered)}“ ← fyrri: „${p?.title}“ (${older.date.slice(0, 10)})`)
  ok(n?.href === enc(newer.slug) && n.title === decode(newer.title.rendered) && /Næsta grein/.test(n.label), `→ næsta: „${n?.title}“ (${newer.date.slice(0, 10)})`)
  ok(links.every((l) => l.img), 'smámyndir birtast (allar þrjár færslur hafa mynd)')
  const layout = await page.evaluate(() => { const [a, b] = document.querySelectorAll('nav[aria-label="Fleiri greinar"] a'); const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return { side: Math.abs(ra.top - rb.top) < 2 && rb.left > ra.right - 1 } })
  ok(layout.side, '1440 px: tveir dálkar hlið við hlið')
  if (SHOTS) { await page.evaluate(() => document.querySelector('nav[aria-label="Fleiri greinar"]').scrollIntoView({ block: 'center' })); await sleep(600); await page.screenshot({ path: `${SHOTS}/nav-1440.png` }) }

  // Smella á „Næsta grein“ (React Router, engin endurhleðsla) og svo endurhlaða
  await page.evaluate(() => document.querySelector('nav[aria-label="Fleiri greinar"] a[rel="next"]').click())
  await page.waitForFunction((t) => document.querySelector('article h1')?.textContent.trim() === t, { timeout: 30000 }, decode(newer.title.rendered))
  ok(new URL(page.url()).pathname === enc(newer.slug), `smellur opnar næstu grein: ${new URL(page.url()).pathname}`)
  await waitNav(page)
  links = await navLinks(page)
  ok(links.find((l) => l.rel === 'prev')?.href === enc(mid.slug), 'þar vísar „Fyrri grein“ aftur á upphaflegu greinina')
  await page.reload({ waitUntil: 'networkidle2' })
  await waitNav(page)
  const h1 = await page.evaluate(() => document.querySelector('article h1').textContent.trim())
  links = await navLinks(page)
  ok(h1 === decode(newer.title.rendered) && links.find((l) => l.rel === 'prev')?.href === enc(mid.slug), 'eftir endurhleðslu: sama grein og sömu tenglar')
  ok(page.errors.length === 0, `engar JS-villur (${page.errors.length})`)
  await page.close()

  // Fyrsta og nýjasta færsla: aðeins önnur áttin
  const [oldest] = await wp('per_page=1&orderby=date&order=asc')
  const [newest] = await wp('per_page=1&orderby=date&order=desc')
  for (const [post, expect] of [[oldest, 'next'], [newest, 'prev']]) {
    page = await open(enc(post.slug), 390, 844)
    await waitNav(page)
    links = await navLinks(page)
    ok(links.length === 1 && links[0].rel === expect, `${post === oldest ? 'elsta' : 'nýjasta'} færslan (${post.date.slice(0, 10)}): aðeins „${links[0]?.label}“`)
    await page.close()
  }
  page = await open(enc(mid.slug), 390, 844)
  await waitNav(page)
  const stacked = await page.evaluate(() => { const [a, b] = document.querySelectorAll('nav[aria-label="Fleiri greinar"] a'); return b.getBoundingClientRect().top >= a.getBoundingClientRect().bottom - 1 })
  ok(stacked, '390 px: tenglarnir hvor undir öðrum')
  if (SHOTS) { await page.evaluate(() => document.querySelector('nav[aria-label="Fleiri greinar"]').scrollIntoView({ block: 'center' })); await sleep(600); await page.screenshot({ path: `${SHOTS}/nav-390.png` }) }
  await page.close()

  console.log('Fljótandi „Fara efst“:')
  for (const [w, h] of [[390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
    for (const path of [enc(mid.slug), '/']) {
      page = await open(path, w, h)
      if (path !== '/') await waitNav(page)
      const r = await page.evaluate(async () => {
        const btn = document.querySelector('button[aria-label="Fara efst"]')
        // 3 rammar: skrunatburður → athugun → React uppfærir hnappinn
        const frame = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(res))))
        const vis = () => btn.dataset.visible === 'true'
        window.scrollTo(0, 0); await frame()
        const top = vis()
        window.scrollTo(0, 300); await frame(); await frame()
        const at300 = vis()
        const sel = 'a[href], button, input, select, textarea, summary, iframe, video, [role="button"], aside[aria-label="Auglýsingar"]'
        let shown = 0, steps = 0, offCenter = 0, size = 0
        const hits = []
        for (let y = 420; y < document.documentElement.scrollHeight - innerHeight; y += 90) {
          window.scrollTo(0, y); await frame(); steps++
          if (!vis()) continue
          shown++
          const b = btn.getBoundingClientRect()
          size = b.width
          offCenter = Math.max(offCenter, Math.abs((b.left + b.right) / 2 - document.documentElement.clientWidth / 2))
          for (const e of document.querySelectorAll(sel)) {
            if (e === btn) continue
            const o = e.getBoundingClientRect()
            const small = e.matches('aside[aria-label="Auglýsingar"]') || o.width < 240 || o.height < 160
            if (small && o.width && o.height && b.left < o.right && b.right > o.left && b.top < o.bottom && b.bottom > o.top) { hits.push(`${e.tagName}@${y}`); break }
          }
        }
        window.scrollTo(0, document.documentElement.scrollHeight)
        await frame()
        return { top, at300, shown, steps, offCenter, size, hits, bottomGap: innerHeight - btn.getBoundingClientRect().bottom, round: getComputedStyle(btn).borderRadius }
      })
      // Smella þegar hnappurinn sést (finnum stað þar sem ekkert er undir honum)
      const y0 = await page.evaluate(async () => {
        const btn = document.querySelector('button[aria-label="Fara efst"]')
        for (let y = 500; y < document.documentElement.scrollHeight; y += 60) {
          window.scrollTo(0, y); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)))
          if (btn.dataset.visible === 'true') return y
        }
        return -1
      })
      await page.evaluate(() => { const b = document.querySelector('button[aria-label="Fara efst"]'); if (b.dataset.visible === 'true') b.click() })
      await sleep(1600)
      const y = await page.evaluate(() => window.scrollY)
      const want = w < 1024 ? 50 : 58
      ok(!r.top && !r.at300 && r.shown > 0 && r.offCenter <= 1 && Math.round(r.size) === want && r.hits.length === 0 && y0 > 0 && y === 0 && r.bottomGap >= 20,
        `${w}px ${path === '/' ? 'forsíða' : 'grein'}: falinn efst=${!r.top && !r.at300}, sýnilegur ${r.shown}/${r.steps} skrefa, miðja ±${r.offCenter.toFixed(1)}px, ${Math.round(r.size)}px hringur, ${Math.round(r.bottomGap)}px frá botni, hylur ekkert=${r.hits.length === 0}${r.hits.length ? ' ' + r.hits.slice(0, 3) : ''}, fer efst=${y === 0}`)
      if (SHOTS && path !== '/' && (w === 390 || w === 1440)) {
        await page.evaluate(() => window.scrollTo(0, 1400)); await sleep(500)
        await page.screenshot({ path: `${SHOTS}/float-${w}.png` })
      }
      if (w === 390 && path !== '/') {
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
        await page.evaluate(async (yy) => { window.scrollTo(0, yy); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); document.querySelector('button[aria-label="Fara efst"]').click() }, y0)
        const yr = await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => res(window.scrollY))))
        ok(yr === 0, `minni hreyfing: stekkur beint efst (${yr})`)
        // Myndasýn opin: hnappurinn hverfur
        const lb = await page.evaluate(async () => {
          const g = document.querySelector('.sh-gallery button'); if (!g) return null
          g.click(); await new Promise((res) => setTimeout(res, 300))
          window.scrollTo(0, 2000); await new Promise((res) => setTimeout(res, 300))
          const v = document.querySelector('button[aria-label="Fara efst"]').dataset.visible
          document.querySelector('dialog[open]')?.close()
          return v
        })
        if (lb !== null) ok(lb === 'false', 'falinn meðan myndasýn er opin')
      }
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Allt stóðst')
process.exit(failures ? 1 : 0)
