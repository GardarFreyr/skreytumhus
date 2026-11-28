/**
 * Vafrapróf: titill greinar má aldrei fara undir/yfir forsíðumynd greinar.
 *
 *  npm run check:hero                                         → staðbundið (vite preview)
 *  BASE_URL=https://skreytumhus.netlify.app npm run check:hero → lifandi útgáfa
 *
 * Raunverulegar WordPress-færslur: stuttir titlar, lengstu titlarnir og titlar með lengstu
 * samsettu orðunum (fundið með því að sækja alla titla úr REST-API). Auk þess er titli einnar
 * greinar skipt út *í prófinu einu* fyrir afar langan titil, til að sannreyna að hausinn þoli
 * framtíðarfærslur – sá texti er aldrei birtur á vefnum.
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4183').replace(/\/$/, '')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SLUGS = [
  'viltu-vinna-100-000-kr-inneign-fra-byko-bykoheimili', // lengsti titillinn (64 stafir)
  'adventu-skreytinga-og-tilbodskvold-blomavals', // langur, með bandstriki
  'svefnherbergjainnblastur', // eitt 25 stafa samsett orð
  'innlit-i-tj-maxx-marshalls-homegoods', // „TJ Maxx/Marshalls/Homegoods…“ án bila
  'pinulitid-hallaerisverkefni', // 30 stafa „orð“ með gæsalöppum
  'hrekkjavokuskreytingar',
  'badherbergisbreytingar',
  'b', // stysti titillinn
]
const STRESS = {
  slug: 'svefnherbergjainnblastur',
  title: 'Jólaskreytingahugmyndasamkeppnisverðlaunaafhendingarathöfn í stofunni og Baðherbergisinnréttingaendurnýjunarverkefnið/TJMaxx/Marshalls/Homegoods – fyrir og eftir…',
}
const WIDTHS = [[390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]]
const MIN_GAP = 32 // px milli texta og myndar þegar hlið við hlið

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let failures = 0
const ok = (cond, msg) => { if (cond) return; failures++; console.log('  ✗ ' + msg) }

/** Mælir haus greinarinnar */
const measure = () => {
  const hero = document.querySelector('[data-hero]')
  const h1 = hero?.querySelector('h1')
  const text = hero?.querySelector('[data-hero-text]') ?? h1?.parentElement
  const media = hero?.querySelector('[data-hero-media] img, [data-hero-media] picture')?.closest('[data-hero-media]') ?? null
  if (!h1) return null
  const r = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height } }
  // Raunveruleg lína fyrir línu: hver lína textans (ekki bara kassinn)
  const range = document.createRange(); range.selectNodeContents(h1)
  const lines = [...range.getClientRects()].filter((x) => x.width > 0)
  const ink = lines.reduce((a, x) => ({ l: Math.min(a.l, x.left), r: Math.max(a.r, x.right), t: Math.min(a.t, x.top), b: Math.max(a.b, x.bottom) }), { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity })
  const cs = getComputedStyle(h1)
  const clipped = [h1, text, hero].some((el) => { const s = getComputedStyle(el); return s.textOverflow === 'ellipsis' || s.webkitLineClamp !== 'none' && s.webkitLineClamp !== '' })
  return {
    title: h1.textContent,
    h1: r(h1), ink, text: r(text), media: media ? r(media) : null,
    scrollOverflow: h1.scrollWidth - h1.clientWidth,
    fontPx: parseFloat(cs.fontSize), lines: Math.round(ink.b - ink.t) / parseFloat(cs.lineHeight || cs.fontSize),
    clipped,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
}

try {
  console.log(`Titill og mynd í haus greina – ${BASE}`)
  const page = await browser.newPage()
  const cases = [...SLUGS.map((slug) => ({ slug })), STRESS]
  for (const c of cases) {
    for (const [w, h] of WIDTHS) {
      await page.setViewport({ width: w, height: h })
      await page.goto(`${BASE}/greinar/${c.slug}`, { waitUntil: 'networkidle2', timeout: 60000 })
      await page.waitForSelector('[data-hero] h1', { timeout: 30000 })
      if (c.title) await page.evaluate((t) => { document.querySelector('[data-hero] h1').textContent = t }, c.title)
      await page.evaluate(() => document.fonts.ready)
      const before = failures
      const m = await page.evaluate(measure)
      const tag = `${c.title ? 'ÁLAGSPRÓF ' : ''}${c.slug} @${w}px`
      ok(m, `${tag}: enginn titill`)
      if (!m) continue
      ok(m.scrollOverflow <= 1, `${tag}: titill breiðari en dálkurinn (${m.scrollOverflow}px)`)
      ok(m.ink.l >= m.text.l - 1 && m.ink.r <= m.text.r + 1, `${tag}: texti fer út fyrir dálkinn (${Math.round(m.ink.r - m.text.r)}px)`)
      ok(!m.clipped, `${tag}: titill styttur`)
      ok(m.docOverflow <= 0, `${tag}: lárétt skrun á síðu (${m.docOverflow}px)`)
      if (m.media) {
        const side = m.media.t < m.text.b - 1 && m.media.b > m.text.t + 1 // hlið við hlið
        if (side) {
          ok(m.ink.r <= m.media.l - MIN_GAP + 1 || m.ink.l >= m.media.r + MIN_GAP - 1, `${tag}: titill nær inn á mynd/bil (${Math.round(m.ink.r - m.media.l)}px)`)
          ok(m.ink.b <= m.text.b + 1, `${tag}: titill fer niður fyrir textadálk`)
        } else {
          ok(m.media.t >= m.text.b + 24 - 1 || m.media.b <= m.text.t - 24 + 1, `${tag}: of lítið bil milli texta og myndar í stöflun`)
        }
      }
      console.log(`  ${failures > before ? '✗' : '✓'} ${tag}: ${m.fontPx.toFixed(0)}px, ${m.lines.toFixed(1)} línur${m.media ? '' : ' (engin mynd)'}`)
    }
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Allt stóðst')
process.exit(failures ? 1 : 0)
