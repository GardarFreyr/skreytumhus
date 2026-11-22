/**
 * Röðun mynda í jafnaðar raðir. Skilar fjölda mynda í hverri röð, í upprunalegri röð.
 * Regla: aldrei ein mynd stök í röð þegar fleiri en ein mynd er í safninu.
 */

/** Tölva: 2–3 í röð. 4 → 2+2, 5 → 3+2, 6 → 3+3, 7 → 3+2+2, 10 → 3+3+2+2 */
export function desktopRows(n: number): number[] {
  if (n <= 3) return n > 0 ? [n] : []
  const r = n % 3
  if (r === 0) return Array(n / 3).fill(3)
  if (r === 2) return [...Array((n - 2) / 3).fill(3), 2]
  return [...Array((n - 4) / 3).fill(3), 2, 2]
}

/** Spjaldtölva: helst tvær í röð; oddatala endar á þremur (5 → 2+3), 3 → 3 */
export function tabletRows(n: number): number[] {
  if (n <= 3) return n > 0 ? [n] : []
  return n % 2 === 0 ? Array(n / 2).fill(2) : [...Array((n - 3) / 2).fill(2), 3]
}

/** Hlutfall myndar (breidd/hæð) úr width/height eða úr skráarnafni WordPress (…-1024x683.jpg). */
export function imageRatio(img: Element): number {
  const w = Number(img.getAttribute('width'))
  const h = Number(img.getAttribute('height'))
  if (w > 0 && h > 0) return w / h
  const m = (img.getAttribute('src') ?? '').match(/-(\d{2,5})x(\d{2,5})\.\w+(?:\?|$)/)
  if (m) return Number(m[1]) / Number(m[2])
  return 4 / 3
}

/** Fyrir hverja mynd: summa hlutfalla og fjöldi í hennar röð, og hvort röðin endi á henni. */
export function rowInfo(ratios: number[], rows: number[]) {
  const out: { rs: number; k: number; end: boolean }[] = []
  let i = 0
  for (const k of rows) {
    const slice = ratios.slice(i, i + k)
    const rs = slice.reduce((a, b) => a + b, 0)
    slice.forEach((_, j) => out.push({ rs, k, end: j === k - 1 }))
    i += k
  }
  return out
}
