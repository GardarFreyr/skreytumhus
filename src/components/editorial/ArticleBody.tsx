import { useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { Lightbox, type LightboxImage } from './Lightbox'

/** Velur stærstu myndina úr srcset fyrir myndaskoðarann. */
function largestSrc(img: HTMLImageElement) {
  const set = img.getAttribute('srcset')
  if (!set) return img.getAttribute('src') ?? ''
  const best = set
    .split(',')
    .map((s) => s.trim().split(/\s+/))
    .map(([url, w]) => ({ url, w: parseInt(w) || 0 }))
    .filter((c) => c.w <= 2048)
    .sort((a, b) => b.w - a.w)[0]
  return best?.url ?? img.getAttribute('src') ?? ''
}

/** Er þessi efsta-stigs eining bara mynd(ir), án texta? */
function isImageBlock(el: Element) {
  if (!el.querySelector('img') || el.querySelector('iframe')) return false
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('figcaption').forEach((c) => c.remove())
  return !clone.textContent?.replace(/\u00a0/g, ' ').trim()
}

interface Prepared {
  html: string
  images: LightboxImage[]
}

/**
 * Raðar efni greinar: textinn heldur lesbreidd, en myndir sem standa saman í
 * upprunalegu greininni raðast í gallerí. Röð mynda og texta helst óbreytt.
 */
function prepare(html: string): Prepared {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild!
  const images: LightboxImage[] = []
  const out = doc.createElement('div')
  let run: Element[] = []

  const flush = () => {
    if (!run.length) return
    const imgs = run.flatMap((b) => [...b.querySelectorAll('img')])
    const gallery = doc.createElement('div')
    gallery.className = 'sh-gallery'
    gallery.setAttribute('data-count', String(Math.min(imgs.length, 3)))
    if (imgs.length > 3) gallery.setAttribute('data-many', '')
    imgs.forEach((img) => {
      const caption = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim()
      const idx = images.length
      images.push({ src: largestSrc(img), alt: img.getAttribute('alt') ?? '', caption })
      const fig = doc.createElement('figure')
      const btn = doc.createElement('button')
      btn.type = 'button'
      btn.setAttribute('data-idx', String(idx))
      btn.setAttribute('aria-label', `Stækka mynd ${idx + 1}${caption ? `: ${caption}` : ''}`)
      const clean = img.cloneNode() as HTMLImageElement
      if (!clean.getAttribute('alt')) clean.setAttribute('alt', '')
      clean.setAttribute('sizes', imgs.length === 1 ? '(min-width: 800px) 760px, 100vw' : '(min-width: 1100px) 380px, 50vw')
      btn.appendChild(clean)
      fig.appendChild(btn)
      if (caption) {
        const fc = doc.createElement('figcaption')
        fc.textContent = caption
        fig.appendChild(fc)
      }
      gallery.appendChild(fig)
    })
    const wrap = doc.createElement('div')
    wrap.className = 'sh-media'
    wrap.appendChild(gallery)
    out.appendChild(wrap)
    run = []
  }

  ;[...root.children].forEach((el) => {
    if (isImageBlock(el)) run.push(el)
    else {
      flush()
      out.appendChild(el.cloneNode(true))
    }
  })
  flush()
  return { html: out.innerHTML, images }
}

export function ArticleBody({ html }: { html: string }) {
  const navigate = useNavigate()
  const [index, setIndex] = useState<number | null>(null)
  const prepared = useMemo(() => prepare(html), [html])

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const btn = target.closest<HTMLButtonElement>('button[data-idx]')
    if (btn) {
      setIndex(Number(btn.dataset.idx))
      return
    }
    const a = target.closest<HTMLAnchorElement>('a[data-internal]')
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault()
      navigate(a.getAttribute('href')!)
    }
  }

  return (
    <>
      {/* Smellir eru framseldir: þeir lenda á raunverulegum <button>/<a> innan efnisins, sem eru lyklaborðsaðgengilegir. */}
      <div className="prose-sh article-flow" onClick={onClick} dangerouslySetInnerHTML={{ __html: prepared.html }} />
      <Lightbox images={prepared.images} index={index} onChange={setIndex} />
    </>
  )
}
