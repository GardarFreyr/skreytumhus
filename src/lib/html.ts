import DOMPurify from 'dompurify'

const ORIGIN_RE = /^https?:\/\/(www\.)?skreytumhus\.is/i

/** Afkóðar HTML-einingar (&#8230; o.s.frv.) í venjulegan texta. */
export function decode(input: string): string {
  if (!input) return ''
  const el = document.createElement('textarea')
  el.innerHTML = input
  return el.value
}

/** Fjarlægir HTML-merki og afkóðar. */
export function plainText(htmlStr: string): string {
  return decode(htmlStr.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Styttir texta á orðaskilum. */
export function truncate(text: string, max = 180): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:–-]+$/, '') + '…'
}

/** Hreinsar excerpt frá WordPress („Read more →“ o.fl.). */
export function cleanExcerpt(htmlStr: string): string {
  return plainText(htmlStr).replace(/\s*(Read more|Lesa meira)\s*→?\s*$/i, '').replace(/\[…\]|\[&hellip;\]/g, '…').replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '').trim()
}

/**
 * Breytir innri tenglum á skreytumhus.is í leiðir á þessum vef þar sem hægt er:
 *  ?p=123          → /p/123 (sem vísar áfram á /greinar/<slug>)
 *  ?cat=104        → /flokkur/id/104
 *  ?page_id=10     → /um-mig, o.s.frv.
 * Aðrir tenglar opnast í nýjum flipa.
 */
export function rewriteHref(href: string): { href: string; internal: boolean } {
  if (!ORIGIN_RE.test(href)) return { href, internal: false }
  try {
    const url = new URL(href)
    const p = url.searchParams.get('p')
    if (p) return { href: `/p/${p}`, internal: true }
    const cat = url.searchParams.get('cat')
    if (cat) return { href: `/flokkur/id/${cat}`, internal: true }
    const pageId = url.searchParams.get('page_id')
    const pageMap: Record<string, string> = { '10': '/um-mig', '3648': '/herbergisbreytingar', '68503': '/tv' }
    if (pageId && pageMap[pageId]) return { href: pageMap[pageId], internal: true }
    const s = url.searchParams.get('s')
    if (s) return { href: `/leit?q=${encodeURIComponent(s)}`, internal: true }
    if (url.pathname.startsWith('/wp-content/')) return { href, internal: false }
  } catch {
    /* ógild slóð: skila óbreyttri */
  }
  return { href, internal: false }
}

/** Hreinsar HTML greinar og lagar tengla og myndir. Keyrir aðeins í vafra. */
export function sanitizeArticleHtml(raw: string): string {
  const clean = DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'loading', 'srcset', 'sizes'],
    FORBID_TAGS: ['style', 'script', 'form', 'input'],
  })
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement

  // Leyfa aðeins iframe frá þekktum myndbandaveitum
  root.querySelectorAll('iframe').forEach((f) => {
    const src = f.getAttribute('src') ?? ''
    if (!/^https:\/\/(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com|www\.visir\.is)\//.test(src)) f.remove()
    else f.setAttribute('loading', 'lazy')
  })
  // Facebook-emoji myndir sem læðast inn úr afrituðum texta
  root.querySelectorAll('img[src*="fbcdn.net/images/emoji"]').forEach((img) => img.replaceWith(doc.createTextNode(img.getAttribute('alt') ?? '')))

  root.querySelectorAll('a[href]').forEach((a) => {
    const { href, internal } = rewriteHref(a.getAttribute('href')!)
    a.setAttribute('href', href)
    if (internal) {
      a.setAttribute('data-internal', '')
      a.removeAttribute('target')
    } else {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })
  root.querySelectorAll('img').forEach((img) => {
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
    img.removeAttribute('class')
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '')
  })
  // Tómar málsgreinar (&nbsp;) gera bara bil
  root.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img,iframe')) p.remove()
  })
  return root.innerHTML
}
