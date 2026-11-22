import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER = 500
/** Auglýsingar og aðrir hlutir sem hnappurinn má aldrei liggja ofan á */
const AVOID = 'aside[aria-label="Auglýsingar"] figure, [data-avoid-fab]'

const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/**
 * „Fara efst“: birtist eftir ~500 px skrun, neðst til hægri.
 * Felur sig meðan hann myndi annars liggja ofan á auglýsingu.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      let next = window.scrollY > SHOW_AFTER
      if (next) {
        const r = el.getBoundingClientRect()
        // Smá svigrúm í kring svo hnappurinn komi ekki alveg upp að auglýsingu
        const zone = new DOMRect(r.left - 4, r.top - 8, r.width + 8, r.height + 16)
        next = ![...document.querySelectorAll(AVOID)].some((n) => overlaps(zone, n.getBoundingClientRect()))
      }
      setShow(next)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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
    <button
      ref={ref}
      type="button"
      onClick={toTop}
      aria-label="Fara efst"
      title="Fara efst"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      data-visible={show}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-30 grid size-11 place-items-center rounded-full border border-stone bg-ivory/92 text-charcoal shadow-[0_8px_24px_-12px_rgb(40_39_36/0.45)] backdrop-blur-md transition-[opacity,transform,background-color,color] duration-300 ease-[var(--ease-editorial)] hover:bg-charcoal hover:text-ivory motion-reduce:transition-none sm:right-5 lg:bottom-6 xl:size-10 xl:right-[max(8px,calc((100%-1440px)/2+8px))] ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp size={18} strokeWidth={1.6} aria-hidden />
    </button>
  )
}
