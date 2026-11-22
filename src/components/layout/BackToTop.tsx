import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER = 400
/** Hnappurinn má aldrei liggja ofan á þessu – þá felur hann sig þar til svæðið er laust */
const ADS = 'aside[aria-label="Auglýsingar"]'
const CONTROLS = 'a[href], button, input, select, textarea, summary, iframe, video, [role="button"]'
/** Smellflötur telst stór (má liggja yfir horni hans) ef hann er a.m.k. svona stór */
const LARGE = { w: 240, h: 160 }

/**
 * „Fara efst“: hringlaga, fljótandi hnappur neðst fyrir miðju skjás.
 * Birtist eftir ~400 px skrun. Felur sig efst á síðu, þegar gluggi (myndasýn, valmynd) er opinn,
 * og á meðan auglýsing eða lítið stjórntæki (tengill, hnappur) er undir honum.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let frame = 0
    const blocked = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      const pad = 8
      const zone = { l: r.left - pad, r: r.right + pad, t: r.top - pad, b: r.bottom + pad }
      const hit = (o: DOMRect) => o.width > 0 && o.height > 0 && zone.l < o.right && zone.r > o.left && zone.t < o.bottom && zone.b > o.top
      if ([...document.querySelectorAll(ADS)].some((n) => hit(n.getBoundingClientRect()))) return true
      for (const n of document.querySelectorAll(CONTROLS)) {
        if (n === el) continue
        const o = n.getBoundingClientRect()
        // Lítil stjórntæki (tenglar, hnappar) má aldrei hylja. Stórir smellfletir (myndir í
        // myndasafni, greinaspjöld) haldast nothæfir þótt hnappurinn liggi yfir horni þeirra.
        if (hit(o) && (o.width < LARGE.w || o.height < LARGE.h)) return true
      }
      return false
    }
    const check = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const modal = document.querySelector('dialog[open], [aria-modal="true"]')
      setShow(window.scrollY > SHOW_AFTER && !modal && !blocked(el))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Myndir sem hlaðast eða gluggar sem opnast breyta því hvað er undir hnappnum
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-modal', 'class'] })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mo.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    // Lyklaborðsnotendur halda áfram efst á síðunni, ekki á hnappi sem hverfur
    const main = document.getElementById('efni')
    if (main) {
      main.tabIndex = -1
      main.focus({ preventScroll: true })
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-30 flex justify-center lg:bottom-7">
      <button
        ref={ref}
        type="button"
        onClick={toTop}
        aria-label="Fara efst"
        title="Fara efst"
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        data-visible={show}
        className={`group grid size-[50px] place-items-center rounded-full border border-ivory/25 bg-charcoal text-ivory shadow-[0_14px_34px_-12px_rgb(31_30_27/0.6)] transition-[opacity,transform,background-color,box-shadow] duration-300 ease-[var(--ease-editorial)] hover:-translate-y-0.5 hover:bg-night hover:shadow-[0_18px_40px_-12px_rgb(31_30_27/0.7)] focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:size-[58px] ${
          show ? 'pointer-events-auto opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <ArrowUp size={21} strokeWidth={1.6} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
      </button>
    </div>
  )
}
