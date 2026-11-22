/**
 * Prófar að allar síður hlaðist – beint, með smellum í valmynd, og í „gömlum flipa“
 * eftir nýja útgáfu (þegar gömlu JS-skrárnar eru horfnar af þjóninum).
 *
 * Keyrsla: BASE_URL=https://skreytumhus.netlify.app npm run check:routes  (sjálfgefið http://localhost:4173)
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const ORIGIN = new URL(BASE).origin
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ROUTES = ['/', '/greinar', '/greinar/kozy-fyrir-og-eftir', '/efnisord', '/efni/jol', '/flokkur/heimili-og-innblastur', '/innblastur', '/herbergisbreytingar', '/herbergisbreytingar/kozy-fyrir-og-eftir', '/tv', '/um-mig', '/samband', '/leit?q=jól', '/p/96003', '/thetta-er-ekki-til']
const NAV = ['Greinar', 'Innblástur', 'Herbergisbreytingar', 'Skreytum Hús TV', 'Um mig', 'Forsíða']

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let failures = 0
const fail = (m) => { failures++; console.log('  ✗ ' + m) }

async function newPage() {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(e.message))
  return page
}
const mainText = (page) => page.evaluate(() => document.querySelector('main')?.innerText.trim().slice(0, 80) ?? '').catch(() => '')
const waitMain = (page) =>
  page.waitForFunction(() => { const m = document.querySelector('main'); return m && m.innerText.trim().length > 20 && !m.querySelector('[aria-busy="true"]') }, { timeout: 30000 }).catch(() => {})

/** Smellir á tengil inni í síðunni (stöðugra en ElementHandle meðan React teiknar). */
async function clickLink(page, label) {
  await page.waitForSelector('nav[aria-label="Aðalvalmynd"] a', { timeout: 15000 })
  return page.evaluate((label) => {
    const a = label === 'Samband'
      ? document.querySelector('footer a[href="/samband"]')
      : [...document.querySelectorAll('nav[aria-label="Aðalvalmynd"] a')].find((x) => x.textContent.trim().toLowerCase() === label.toLowerCase())
    a?.click()
    return !!a
  }, label)
}

try {
  console.log('Beint:')
  for (const r of ROUTES) {
    const page = await newPage()
    const res = await page.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 })
    await waitMain(page)
    const t = await mainText(page)
    if (res.status() !== 200 || !t || page.errors.length) fail(`${r}: ${res.status()} ${page.errors.join(' | ')}`)
    else console.log(`  ✓ ${r}  „${t.split('\n')[0]}“`)
    await page.close()
  }

  console.log('Valmynd:')
  {
    const page = await newPage()
    await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
    for (const label of NAV) {
      if (!(await clickLink(page, label))) { fail(`fann ekki tengil „${label}“`); continue }
      await waitMain(page)
      const t = await mainText(page)
      if (!t || page.errors.length) fail(`${label}: ${page.errors.join(' | ')}`)
      else console.log(`  ✓ ${label} → ${new URL(page.url()).pathname}`)
    }
    await page.close()
  }

  // Gamall flipi: síðan er opnuð, svo kemur „ný útgáfa“ – allar JS-skrár síðna (aðrar en
  // aðalskráin) svara 404 eins og Netlify gerir eftir útgáfu. Smellur verður samt að virka:
  //  a) strax eftir opnun: síður ekki forhlaðnar → síðan á að endurhlaðast sjálf
  //  b) eftir nokkrar sekúndur: síður forhlaðnar → virkar án endurhleðslu
  console.log('Gamall flipi eftir nýja útgáfu:')
  const cases = [['Um mig', 0, '/'], ['Skreytum Hús TV', 0, '/'], ['Greinar', 0, '/'], ['Um mig', 6000, '/'], ['Skreytum Hús TV', 6000, '/'], ['Samband', 6000, '/um-mig']]
  for (const [label, waitMs, start] of cases) {
    const page = await newPage()
    await page.goto(BASE + start, { waitUntil: waitMs ? 'networkidle2' : 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, waitMs))
    await page.setRequestInterception(true)
    let deployed = true
    let reloads = 0
    page.on('request', (req) => {
      if (req.isInterceptResolutionHandled()) return
      const u = new URL(req.url())
      if (req.resourceType() === 'document') { deployed = false; reloads++ }
      else if (deployed && u.origin === ORIGIN && /\/assets\/(?!index-|react-).+\.js$/.test(u.pathname)) {
        return req.respond({ status: 404, contentType: 'text/html', body: '<!doctype html><title>Not found</title>' })
      }
      req.continue()
    })
    if (!(await clickLink(page, label))) { fail(`fann ekki tengil „${label}“`); await page.close(); continue }
    await new Promise((r) => setTimeout(r, 1500))
    await waitMain(page)
    const t = await mainText(page)
    const path = new URL(page.url()).pathname
    if (!t || /úrskeiðis|Síðan uppfærðist|Failed/i.test(t)) fail(`${label} (eftir ${waitMs / 1000}s): ${path} sýnir „${t.split('\n')[0]}“`)
    else console.log(`  ✓ ${label} (eftir ${waitMs / 1000}s) → ${path}  „${t.split('\n')[0]}“  ${reloads ? 'endurhlóðst sjálfkrafa' : 'úr forhlöðnu minni, engin endurhleðsla'}`)
    await page.close()
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Allar síður hlaðast')
process.exit(failures ? 1 : 0)
