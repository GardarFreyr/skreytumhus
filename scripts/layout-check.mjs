#!/usr/bin/env node
/**
 * Sjálfvirk útlitsprófun (layout regression check) fyrir Skreytum Hús.
 *
 *   npm run build && npm run preview      # í öðrum glugga
 *   npm run check:layout                  # prófar http://localhost:4173
 *   BASE_URL=https://skreytumhus.netlify.app npm run check:layout
 *
 * Opnar hverja síðu í Chrome á 390, 768, 1024, 1440 og 1920 px breidd, vistar skjáskot í
 * layout-report/ og fellur (exit 1) ef einhver af reglunum hér að neðan brotnar:
 *
 *  hero      Texti í tvískiptum haus (SplitHero) er miðjaður á móti myndinni — ekkert stórt tómt
 *            svæði ofan eða neðan við texta — og titillinn sést í fyrstu sýn.
 *  overlay   Texti ofan á ljósmynd er innan dökka hlutans af .scrim (≥ 74 % þekja) og
 *            textahólfið hylur ekki meira en 80 % myndarinnar.
 *  grid      Myndir í sömu röð í .card-grid / .tile-grid hafa sama topp, hæð og breidd; jöfn dálkabil.
 *  blank     Ekkert autt lóðrétt bil (ekkert efni þvert yfir síðuna) stærra en bilakerfið leyfir.
 *  clip      Fyrirsagnir og texti klippast ekki lárétt (nema viljandi styttingar með „…“).
 *  overflow  Engin lárétt skrunun.
 *  images    Engar brotnar myndir; allar rammamyndir nota object-fit: cover (aldrei teygðar).
 *  cls       Cumulative Layout Shift < 0.1 meðan síðan hleðst.
 */
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const BASE = (process.env.BASE_URL || 'http://localhost:4173').replace(/\/$/, '')
const WIDTHS = (process.env.WIDTHS || '390,768,1024,1440,1920').split(',').map(Number)
const ROUTES = (process.env.ROUTES || '/,/greinar,/flokkur/heimili-og-innblastur,@latest-article,/greinar/kozy-fyrir-og-eftir,/herbergisbreytingar/kozy-fyrir-og-eftir,/innblastur,/herbergisbreytingar,/tv,/um-mig,/samband,/leit?q=jól,/thetta-er-ekki-til').split(',')
const OUT = 'layout-report'
const CHROME =
  process.env.CHROME_PATH ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p))

if (!CHROME) {
  console.error('Fann ekki Chrome. Settu CHROME_PATH=/slóð/að/chrome')
  process.exit(2)
}

/** Keyrt inni í síðunni: skilar lista af vandamálum. */
function audit() {
  const issues = []
  const W = innerWidth
  const add = (rule, msg) => issues.push({ rule, msg })
  const vis = (el) => {
    if (!el || !el.offsetParent) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  /** Ljós og nær ógegnsær texti? Styður rgb(), oklab() og oklch() (Tailwind v4 notar oklab). */
  const isLightText = (color) => {
    const n = (color.match(/-?\d*\.?\d+(e-?\d+)?/g) || []).map(Number)
    const alpha = /\//.test(color) || /^rgba/.test(color) ? n[3] ?? 1 : 1
    const light = /^okl/.test(color) ? n[0] >= 0.9 : n[0] >= 225 && n[1] >= 225 && n[2] >= 220
    return light && alpha >= 0.85
  }
  const srOnly = (el) => el.closest('.sr-only') || el.getBoundingClientRect().width <= 1
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, width: r.width, height: r.height }
  }

  // hero — texti miðjaður á móti mynd, titill í fyrstu sýn
  for (const hero of document.querySelectorAll('[data-hero]')) {
    if (!vis(hero)) continue
    const t = hero.querySelector('[data-hero-text]')
    const m = hero.querySelector('[data-hero-media]')
    const h1 = hero.querySelector('h1')
    if (t && m && vis(t) && vis(m)) {
      const tb = box(t), mb = box(m)
      const sideBySide = tb.right <= mb.left + 1 || mb.right <= tb.left + 1
      if (sideBySide) {
        const above = tb.top - mb.top, below = mb.bottom - tb.bottom
        const empty = Math.max(above, below, 0)
        if (empty > mb.height * 0.4 && empty > 160) add('hero', `${Math.round(empty)}px autt svæði við hlið myndar (myndhæð ${Math.round(mb.height)}px)`)
        if (Math.abs(above - below) > mb.height * 0.45 && tb.height < mb.height) add('hero', `texti ekki miðjaður á móti mynd (ofan ${Math.round(above)} / neðan ${Math.round(below)})`)
      }
    }
    if (h1 && W >= 1024) {
      const r = h1.getBoundingClientRect()
      if (r.top + scrollY > innerHeight - 40) add('hero', `titill byrjar neðan við fyrstu sýn (${Math.round(r.top + scrollY)}px > ${innerHeight}px)`)
    }
  }

  // overlay — texti á mynd innan dekkta hlutans
  for (const cap of document.querySelectorAll('[data-photo-caption]')) {
    if (!vis(cap) || getComputedStyle(cap).opacity === '0') continue
    const cb = box(cap)
    const fade = parseFloat(getComputedStyle(cap).paddingTop) || 0
    const frame = cap.parentElement?.querySelector('.frame')
    if (frame && cb.height > box(frame).height * 0.8) add('overlay', `textahólf hylur ${Math.round((cb.height / box(frame).height) * 100)}% myndar`)
    for (const el of cap.querySelectorAll('h1,h2,h3,p,span,time')) {
      if (!vis(el) || !el.textContent.trim()) continue
      const eb = box(el)
      if (eb.top < cb.top + fade - 1) add('overlay', `texti „${el.textContent.trim().slice(0, 30)}“ er ofan við dekkta hluta skuggans`)
      if (!isLightText(getComputedStyle(el).color)) add('overlay', `of daufur texti á mynd: ${getComputedStyle(el).color} („${el.textContent.trim().slice(0, 24)}“)`)
    }
  }

  // grid — myndir í sömu röð jafnar
  for (const g of document.querySelectorAll('.card-grid, .tile-grid, main ul.flex-wrap.justify-center')) {
    if (!vis(g) || !g.querySelector('.frame')) continue
    const rows = new Map()
    for (const it of [...g.children].filter(vis)) {
      const k = Math.round(box(it).top)
      if (!rows.has(k)) rows.set(k, [])
      rows.get(k).push(it)
    }
    for (const [k, row] of rows) {
      const fr = row.map((i) => i.querySelector('.frame')).filter(Boolean).map(box)
      if (fr.length < 2) continue
      const spread = (f) => Math.max(...fr.map(f)) - Math.min(...fr.map(f))
      for (const [n, f] of [['toppar', (r) => r.top], ['hæðir', (r) => r.height], ['breiddir', (r) => r.width]])
        if (spread(f) > 0.5) add('grid', `röð við ${k}px: myndir ólíkar (${n} munar ${spread(f).toFixed(1)}px)`)
      const s = [...fr].sort((a, b) => a.left - b.left)
      const gaps = s.slice(1).map((r, i) => r.left - s[i].right)
      if (gaps.length > 1 && Math.max(...gaps) - Math.min(...gaps) > 0.5) add('grid', `röð við ${k}px: ójöfn dálkabil`)
      if (!g.classList.contains('tile-grid')) {
        const heads = row.map((i) => i.querySelector('h2,h3')).filter(Boolean).map((h) => box(h).top)
        if (heads.length > 1 && Math.max(...heads) - Math.min(...heads) > 0.5) add('grid', `röð við ${k}px: titlar byrja í ólíkri hæð`)
      }
    }
  }

  // blank — lengsta auða lóðrétta bil
  const content = [...document.querySelectorAll('main *, footer *')].filter((el) => {
    if (!vis(el)) return false
    if (el.matches('img,svg,video,iframe,input,textarea,select,button,.frame,.skeleton,hr')) return true
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  }).map(box).sort((a, b) => a.top - b.top)
  const limit = W >= 1024 ? 300 : W >= 768 ? 260 : 220
  let reach = content.length ? content[0].bottom : 0
  for (const r of content) {
    if (r.top - reach > limit) add('blank', `${Math.round(r.top - reach)}px autt bil við ${Math.round(reach)}px (hámark ${limit}px)`)
    reach = Math.max(reach, r.bottom)
  }

  // clip — lárétt klipptur texti (viljandi styttingar með ellipsis undanskildar)
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main a, main span, main time')) {
    if (!vis(el) || srOnly(el)) continue
    const cs = getComputedStyle(el)
    if (cs.textOverflow === 'ellipsis') continue
    if (el.scrollWidth > el.clientWidth + 1 && (cs.overflowX === 'hidden' || cs.overflow === 'hidden') && cs.display !== 'inline')
      add('clip', `klipptur texti: „${el.textContent.trim().slice(0, 40)}“`)
    const parent = el.parentElement
    if (parent && cs.display === 'inline' && getComputedStyle(parent).overflow === 'hidden' && getComputedStyle(parent).textOverflow !== 'ellipsis') {
      const pr = parent.getBoundingClientRect(), r = el.getBoundingClientRect()
      if (r.right > pr.right + 0.5 && el.textContent.trim()) add('clip', `klipptur texti: „${el.textContent.trim().slice(0, 40)}“`)
    }
  }

  // overflow
  const over = document.documentElement.scrollWidth - innerWidth
  if (over > 0) add('overflow', `lárétt skrunun: ${over}px`)

  // images
  const imgs = [...document.querySelectorAll('main img')].filter(vis)
  const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0)
  if (broken.length) add('images', `${broken.length} brotnar myndir: ${broken.slice(0, 3).map((i) => i.src.split('/').pop()).join(', ')}`)
  const stretched = [...document.querySelectorAll('main .frame > img')].filter(vis).filter((i) => getComputedStyle(i).objectFit !== 'cover')
  if (stretched.length) add('images', `${stretched.length} myndir án object-fit: cover`)

  // cls
  const cls = (window.__cls || 0)
  if (cls >= 0.1) add('cls', `layout shift ${cls.toFixed(3)} (≥ 0.1): ${JSON.stringify((window.__clsSources || []).filter((x) => x.v > 0.005)).slice(0, 600)}`)

  return { issues, cls }
}

async function settle(page) {
  await page.waitForNetworkIdle({ idleTime: 600, timeout: 20000 }).catch(() => {})
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += Math.round(innerHeight * 0.8)) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 6000) })))
    scrollTo(0, 0)
    document.getAnimations().forEach((a) => a.finish())
  })
  await page.waitForNetworkIdle({ idleTime: 400, timeout: 10000 }).catch(() => {})
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--hide-scrollbars'] })
await mkdir(OUT, { recursive: true })
const report = []
let failures = 0

try {
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue
        window.__cls += e.value
        ;(window.__clsSources ||= []).push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), nodes: (e.sources || []).map((x) => x.node ? (x.node.tagName || '#text') + '.' + String(x.node.className || '').slice(0, 50) + ' ' + JSON.stringify([Math.round(x.previousRect.y), Math.round(x.currentRect.y), Math.round(x.previousRect.height), Math.round(x.currentRect.height)]) : '?') })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })

  let latest = null
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: w >= 1024 ? (w >= 1920 ? 1080 : 900) : w >= 768 ? 1024 : 844 })
    for (let route of ROUTES) {
      if (route === '@latest-article') {
        if (!latest) {
          await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
          await settle(page)
          latest = await page.evaluate(() => [...document.querySelectorAll('main a[href^="/greinar/"]')].map((a) => a.getAttribute('href')).find((h) => h.split('/').length === 3))
        }
        if (!latest) continue
        route = latest
      }
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
      await settle(page)
      const { issues, cls } = await page.evaluate(audit)
      const name = `${w}${route.replace(/[^a-z0-9]+/gi, '_') || '_home'}`.slice(0, 90)
      await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 60, fullPage: true })
      const uniq = [...new Map(issues.map((i) => [i.rule + i.msg, i])).values()]
      failures += uniq.length
      report.push({ width: w, route, cls: Number(cls.toFixed(4)), issues: uniq })
      console.log(`${uniq.length ? '✗' : '✓'} ${String(w).padStart(4)}px ${route}${uniq.length ? '' : `  (CLS ${cls.toFixed(3)})`}`)
      for (const i of uniq.slice(0, 8)) console.log(`      [${i.rule}] ${i.msg}`)
      if (uniq.length > 8) console.log(`      … og ${uniq.length - 8} til viðbótar`)
    }
  }
} finally {
  await browser.close()
}

await writeFile(`${OUT}/report.json`, JSON.stringify({ base: BASE, date: new Date().toISOString(), report }, null, 2))
console.log(`\n${failures ? `✗ ${failures} vandamál` : '✓ Engin vandamál'} — skjáskot og report.json í ${OUT}/`)
process.exit(failures ? 1 : 0)
