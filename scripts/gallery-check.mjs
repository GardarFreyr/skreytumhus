/**
 * Prófar myndasöfn í raunverulegum greinum og efnisorðaleit.
 * Keyrsla: npm run build && npx vite preview --port 4173, svo `npm run check:gallery`.
 * Fyrir hvert myndasafn: allar raðir jafnháar, engin röð með einni mynd (nema safnið sé 1 mynd),
 * raðir fylla breidd sína, myndir í upprunalegri röð, alt-texti varðveittur.
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const WIDTHS = (process.env.WIDTHS ?? '390,768,1024,1440,1920').split(',').map(Number)
const ARTICLES = (process.env.ARTICLES ?? 'fegurdin-fra-vast-is,textaverkin-hans-bubba-v,notalegt-haust,dasamlega-heillandi-innlit,fullkomin-jolastemming,innlit-9,kastalaheimsokn').split(',')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] })
let failures = 0
const fail = (m) => { failures++; console.log('   ✗ ' + m) }

try {
  const page = await browser.newPage()
  for (const slug of ARTICLES) {
    // Upprunaleg röð mynda úr WordPress
    const src = await (await fetch(`https://www.skreytumhus.is/?rest_route=/wp/v2/posts&slug=${encodeURIComponent(slug)}&_fields=content`)).json()
    const origOrder = [...(src[0]?.content?.rendered ?? '').matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1].split('/').pop())
    for (const w of WIDTHS) {
      await page.setViewport({ width: w, height: 900 })
      await page.goto(`${BASE}/greinar/${slug}`, { waitUntil: 'networkidle2', timeout: 60000 })
      await page.waitForSelector('.sh-gallery', { timeout: 30000 })
      const r = await page.evaluate(() => {
        const out = []
        for (const g of document.querySelectorAll('.sh-gallery')) {
          const figs = [...g.querySelectorAll(':scope > figure')]
          const rows = []
          for (const f of figs) {
            const b = f.querySelector('button').getBoundingClientRect()
            const last = rows.at(-1)
            if (last && Math.abs(last.top - b.top) < 2) last.items.push(b)
            else rows.push({ top: b.top, items: [b] })
          }
          out.push({
            n: figs.length,
            gw: g.getBoundingClientRect().width,
            rows: rows.map((r) => ({ k: r.items.length, hs: r.items.map((b) => Math.round(b.height)), w: Math.round(r.items.at(-1).right - r.items[0].left) })),
            alts: figs.every((f) => f.querySelector('img').hasAttribute('alt')),
          })
        }
        const order = [...document.querySelectorAll('.prose-sh img')].map((i) => i.getAttribute('src').split('/').pop())
        return { out, order }
      })
      const multi = r.out.filter((g) => g.n > 1)
      const sizes = multi.map((g) => `${g.n}:${g.rows.map((x) => x.k).join('+')}`)
      console.log(`${String(w).padStart(4)}px ${slug}  ${sizes.join('  ')}`)
      for (const g of multi) {
        if (w >= 640 && g.rows.some((x) => x.k === 1)) fail(`${g.n} myndir: röð með einni mynd (${g.rows.map((x) => x.k).join('+')})`)
        for (const x of g.rows) {
          if (Math.max(...x.hs) - Math.min(...x.hs) > 2) fail(`${g.n} myndir: misháar myndir í röð (${x.hs.join(', ')})`)
        }
        if (w >= 640) {
          const widths = g.rows.map((x) => x.w)
          // Raðir eiga að vera jafnbreiðar nema hámarkshæð hafi þrengt röð
          if (g.rows.length > 1 && Math.max(...widths) - Math.min(...widths) > 2 && Math.max(...g.rows.map((x) => x.hs[0])) < 600) fail(`${g.n} myndir: misbreiðar raðir (${widths.join(', ')})`)
        }
        if (!g.alts) fail(`${g.n} myndir: vantar alt`)
      }
      if (w < 640 && r.out.some((g) => g.rows.some((x) => x.k > 1))) fail('sími: fleiri en ein mynd í röð')
      const orig = origOrder.filter((s) => r.order.includes(s))
      if (orig.join('|') !== r.order.filter((s) => origOrder.includes(s)).join('|')) fail('myndir ekki í upprunalegri röð')
    }
  }

  // Efnisorðaleit
  await page.setViewport({ width: 1440, height: 900 })
  for (const [q, expect] of [['jól', 'Jól'], ['jol', 'Jól'], ['eldh', 'Eldhús'], ['þvott', 'Þvottahús'], ['barnaherb', 'Barnaherbergi'], ['slipp', 'Slippfélagið'], ['páska', 'Páskar'], ['fyrir', 'Fyrir/eftir'], ['málning', 'Málning'], ['husgagna', 'Húsgagnahöllin']]) {
    await page.goto(`${BASE}/efnisord?q=${encodeURIComponent(q)}`, { waitUntil: 'networkidle2' })
    await page.waitForSelector('main ul a.chip', { timeout: 30000 }).catch(() => {})
    const names = await page.$$eval('main ul a.chip', (as) => as.map((a) => a.firstChild.textContent.trim()))
    const ok = names.includes(expect) && !(q === 'jól' && names.includes('Fjölskyldan'))
    if (!ok) fail(`leit „${q}“ fann ekki „${expect}“ (${names.slice(0, 6).join(', ')})`)
    else console.log(`✓ leit „${q}“ → ${names.slice(0, 5).join(', ')}`)
  }
  // Smellt á efnisorð → greinalisti með raunverulegum fjölda
  await page.goto(`${BASE}/efni/jol`, { waitUntil: 'networkidle2' })
  await page.waitForFunction(() => document.querySelector('main h1')?.textContent !== '…' && document.querySelector('main header [aria-live]'), { timeout: 30000 }).catch(() => {})
  const head = await page.$eval('main h1', (h) => h.textContent)
  const count = await page.$eval('main header [aria-live]', (p) => p.textContent).catch(() => '')
  console.log(`✓ /efni/jol → „${head}“, ${count}`)
  if (head !== 'Jól' || !/\d/.test(count)) fail('/efni/jol sýnir ekki greinar')
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Öll myndasöfn jöfn og leit virkar')
process.exit(failures ? 1 : 0)
