/**
 * Vafrapróf fyrir fótinn: hvítt merki (og enginn aukahnappur í fætinum).
 * Keyrsla: npm run check:footer  (BASE_URL=https://skreytumhus.netlify.app fyrir lifandi vef)
 */
import puppeteer from 'puppeteer-core'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SHOTS = process.env.SHOTS
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let failures = 0
const ok = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { failures++; console.log('  ✗ ' + msg) } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try {
  for (const [w, h] of [[390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
    console.log(`${w}px:`)
    for (const path of ['/', '/p/96003']) {
      const page = await browser.newPage()
      await page.setViewport({ width: w, height: h })
      await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 60000 })
      if (path !== '/') await page.waitForSelector('article h1', { timeout: 30000 })
      await page.waitForSelector('footer.bg-night img[alt="Skreytum Hús"]', { timeout: 30000 })
      await page.evaluate(() => document.querySelector('footer.bg-night').scrollIntoView({ block: 'end' }))
      await sleep(700)
      const r = await page.evaluate(async () => {
        const footer = document.querySelector('footer.bg-night')
        const img = footer.querySelector('img[alt="Skreytum Hús"]')
        await img.decode().catch(() => {})
        // Lit merkisins: meðalbirta ógegnsærra díla í myndinni sjálfri
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
        const x = c.getContext('2d'); x.drawImage(img, 0, 0)
        const d = x.getImageData(0, 0, c.width, c.height).data
        let sum = 0, n = 0, minL = 255, rightInk = 0
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) {
          const L = (d[i] + d[i + 1] + d[i + 2]) / 3; sum += L; n++; minL = Math.min(minL, L)
          if ((i / 4) % c.width > c.width * 0.75) rightInk++ // hjörtun eru hægra megin
        }
        const footerTop = [...footer.querySelectorAll('button')].filter((b) => /Fara efst/.test(b.textContent + b.getAttribute('aria-label'))).length
        const allTop = document.querySelectorAll('button[aria-label="Fara efst"], button[title="Fara efst"]').length
        return {
          src: img.currentSrc.split('/').pop(), natural: img.naturalWidth, shown: img.getBoundingClientRect().width,
          meanL: Math.round(sum / n), minL, rightInk,
          footerTop, allTop,
        }
      })
      if (SHOTS && path === '/') await page.screenshot({ path: `${SHOTS}/footer-${w}.png` })
      ok(/logo-white/.test(r.src) && r.meanL >= 250 && r.minL >= 250 && r.rightInk > 1000,
        `${path} merki hvítt (${r.src}, birta ${r.meanL}/${r.minL}, hjörtu ${r.rightInk} dílar), skarpt: ${r.natural}px mynd í ${Math.round(r.shown)}px`)
      ok(r.footerTop === 0 && r.allTop === 1, `${path} enginn „Fara efst“ í fæti, einn hnappur á síðunni (${r.allTop})`)
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n✗ ${failures} vandamál` : '\n✓ Fótur í lagi')
process.exit(failures ? 1 : 0)
