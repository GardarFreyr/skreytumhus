import { useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { Lightbox, type LightboxImage } from './Lightbox'
import { desktopRows, imageRatio, rowInfo, tabletRows } from './galleryLayout'

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
    gallery.setAttribute('data-count', String(imgs.length))
    // Jafnaðar raðir: hlutföll mynda ráða breidd, svo myndir í sömu röð verða jafnháar
    const ratios = imgs.map((img) => Math.min(3, Math.max(0.4, imageRatio(img))))
    const lg = rowInfo(ratios, desktopRows(imgs.length))
    const md = rowInfo(ratios, tabletRows(imgs.length))
    const fmt = (n: number) => n.toFixed(4)
    imgs.forEach((img, i) => {
      const caption = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim()
      const idx = images.length
      images.push({ src: largestSrc(img), alt: img.getAttribute('alt') ?? '', caption })
      const fig = doc.createElement('figure')
      fig.setAttribute('style', `--ar:${fmt(ratios[i])};--rs-lg:${fmt(lg[i].rs)};--k-lg:${lg[i].k};--rs-md:${fmt(md[i].rs)};--k-md:${md[i].k}`)
      const btn = doc.createElement('button')
      btn.type = 'button'
      btn.setAttribute('data-idx', String(idx))
      btn.setAttribute('aria-label', `Stækka mynd ${idx + 1}${caption ? `: ${caption}` : ''}`)
      const clean = img.cloneNode() as HTMLImageElement
      if (!clean.getAttribute('alt')) clean.setAttribute('alt', '')
      clean.setAttribute('sizes', imgs.length === 1 ? '(min-width: 800px) 760px, 100vw' : `(min-width: 1024px) ${lg[i].k === 2 ? 590 : 400}px, (min-width: 640px) 50vw, 100vw`)
      btn.appendChild(clean)
      fig.appendChild(btn)
      if (caption) {
        const fc = doc.createElement('figcaption')
        fc.textContent = caption
        fig.appendChild(fc)
      }
      gallery.appendChild(fig)
      // Línuskil eftir hverja röð (eitt sett fyrir tölvu, annað fyrir spjaldtölvu)
      for (const [bp, info] of [['lg', lg[i]], ['md', md[i]]] as const) {
        if (info.end && i < imgs.length - 1) {
          const br = doc.createElement('span')
          br.className = 'sh-br'
          br.setAttribute('data-bp', bp)
          br.setAttribute('aria-hidden', 'true')
          gallery.appendChild(br)
        }
      }
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
