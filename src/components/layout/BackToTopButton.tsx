import { ArrowUp } from 'lucide-react'

/** „Fara efst“ neðst í fæti: skrunar mjúklega efst (eða stekkur, ef gestur vill minni hreyfingu). */
export function BackToTopButton() {
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    // Lyklaborðsnotendur halda áfram efst á síðunni
    const main = document.getElementById('efni')
    if (main) {
      main.tabIndex = -1
      main.focus({ preventScroll: true })
    }
  }
  return (
    <button
      type="button"
      onClick={toTop}
      className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-ivory px-9 text-[12.5px] font-medium uppercase tracking-[0.18em] text-charcoal shadow-[0_10px_30px_-14px_rgb(0_0_0/0.6)] transition-[background-color,transform] duration-300 ease-[var(--ease-editorial)] hover:-translate-y-0.5 hover:bg-white focus-visible:outline-ivory motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <ArrowUp size={18} strokeWidth={1.7} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
      Fara efst
    </button>
  )
}
