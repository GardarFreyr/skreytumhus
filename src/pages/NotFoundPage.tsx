import { Link, useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { useSeo } from '../lib/seo'

export default function NotFoundPage() {
  const navigate = useNavigate()
  useSeo({ title: 'Síða fannst ekki' })
  return (
    <section className="wrap grid min-h-[70vh] items-center py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Villa 404</p>
        <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)]">
          Þessi síða <em className="text-taupe-ink">fannst ekki…</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          Kannski hefur hún verið færð, eða slóðin hefur breyst. Prófaðu að leita — safnið nær aftur til 2010.
        </p>
        <form
          role="search"
          className="mx-auto mt-10 flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const q = new FormData(e.currentTarget).get('q')?.toString().trim()
            if (q) navigate(`/leit?q=${encodeURIComponent(q)}`)
          }}
        >
          <label htmlFor="nf-q" className="sr-only">Leita</label>
          <input id="nf-q" name="q" type="search" placeholder="Leita…" className="h-12 min-w-0 flex-1 rounded-full border border-stone bg-white/60 px-5 outline-none focus:border-charcoal" />
          <button type="submit" className="btn btn-dark" aria-label="Leita"><Search size={16} aria-hidden /></button>
        </form>
        <Link to="/" className="btn btn-line mt-6">Aftur á forsíðu</Link>
      </div>
    </section>
  )
}
