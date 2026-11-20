import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Menu, Search, X } from 'lucide-react'
import { mainNav } from '../../data/site'
import { Wordmark } from './Wordmark'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Loka valmyndum þegar skipt er um síðu
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  return (
    <header className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-500 ${scrolled ? 'border-line bg-ivory/92 backdrop-blur-md' : 'border-transparent bg-ivory'}`}>
      <div className="wrap">
        {/* Efri lína: merki fyrir miðju, leit til hægri */}
        <div className={`grid grid-cols-[48px_1fr_48px] items-center transition-[height] duration-500 ${scrolled ? 'h-16 lg:h-[68px]' : 'h-[72px] lg:h-[104px]'}`}>
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full hover:bg-cream lg:hidden"
            aria-label="Opna valmynd"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.5} aria-hidden />
          </button>
          <span className="hidden lg:block" />
          <Link to="/" className="justify-self-center" title="Forsíða">
            <Wordmark compact={scrolled} />
          </Link>
          <button
            type="button"
            className="grid size-12 place-items-center justify-self-end rounded-full hover:bg-cream"
            aria-label="Leita"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={20} strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        {/* Aðalvalmynd á stærri skjám */}
        <nav aria-label="Aðalvalmynd" className={`hidden justify-center lg:flex ${scrolled ? 'pb-3' : 'pb-5'}`}>
          <ul className="flex items-center gap-10 xl:gap-14">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={'end' in item} className="link-u text-[12.5px] font-medium uppercase tracking-[0.18em] text-charcoal">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="animate-fade border-t border-line bg-ivory">
      <form
        role="search"
        className="wrap flex items-center gap-4 py-5"
        onSubmit={(e) => {
          e.preventDefault()
          const q = input.current?.value.trim()
          if (q) navigate(`/leit?q=${encodeURIComponent(q)}`)
        }}
      >
        <label htmlFor="header-search" className="sr-only">Leita í öllum greinum</label>
        <Search size={22} strokeWidth={1.4} aria-hidden className="shrink-0 text-muted" />
        <input
          ref={input}
          id="header-search"
          type="search"
          placeholder="Leita í safninu… t.d. eldhús, jól, DIY"
          className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted/70 sm:text-3xl"
          enterKeyHint="search"
        />
        <button type="submit" className="btn btn-dark hidden sm:inline-flex">Leita</button>
        <button type="button" onClick={onClose} aria-label="Loka leit" className="grid size-11 place-items-center rounded-full hover:bg-cream">
          <X size={20} aria-hidden />
        </button>
      </form>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      id="mobile-menu"
      aria-label="Valmynd"
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-ivory p-0 text-charcoal backdrop:bg-transparent open:animate-fade lg:hidden"
    >
      <div className="flex h-full flex-col px-5 pb-8 sm:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Wordmark compact />
          <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full hover:bg-cream" aria-label="Loka valmynd" autoFocus>
            <X size={22} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <nav aria-label="Valmynd" className="mt-6 flex-1">
          <ul>
            {mainNav.map((item, i) => (
              <li key={item.to} className="animate-rise border-b border-line" style={{ animationDelay: `${60 + i * 45}ms` }}>
                <NavLink to={item.to} end={'end' in item} className="flex items-baseline justify-between py-4 font-display text-[2rem] leading-none aria-[current=page]:italic aria-[current=page]:text-taupe-ink">
                  {item.label}
                  <span className="font-sans text-[11px] tracking-[0.2em] text-muted">0{i + 1}</span>
                </NavLink>
              </li>
            ))}
            <li className="animate-rise border-b border-line" style={{ animationDelay: '340ms' }}>
              <NavLink to="/samband" className="flex items-baseline justify-between py-4 font-display text-[2rem] leading-none">
                Samband
                <span className="font-sans text-[11px] tracking-[0.2em] text-muted">07</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <Link to="/leit" className="btn btn-dark mt-8 w-full">
          <Search size={16} aria-hidden /> Leita í safninu
        </Link>
      </div>
    </dialog>
  )
}
