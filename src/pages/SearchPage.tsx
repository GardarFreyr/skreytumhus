import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { useArticles } from '../features/articles/hooks'
import { useSeo } from '../lib/seo'
import { formatNumber } from '../lib/format'
import { ArticleCard } from '../components/editorial/ArticleCard'
import { Pagination } from '../components/ui/Pagination'
import { CardSkeletons, EmptyState, ErrorState } from '../components/ui/States'
import { topics } from '../data/taxonomy'

const SUGGESTIONS = ['Eldhús', 'Barnaherbergi', 'Jól', 'DIY', 'Borðskreytingar', 'Fyrir og eftir', 'Haust', 'Blóm']

/**
 * Leit í öllu safninu. Notar leit WordPress (titill, útdráttur og meginmál),
 * sem styður íslenska stafi. Leitarorðið er í slóðinni (?q=) svo hægt sé að deila niðurstöðum.
 */
export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const page = Math.max(1, Number(params.get('sida')) || 1)
  const [value, setValue] = useState(q)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => setValue(q), [q])
  useEffect(() => {
    if (!q) input.current?.focus()
  }, [q])

  useSeo({ title: q ? `Leit: ${q}` : 'Leit' })
  const results = useArticles(q ? { search: q, page, perPage: 12 } : null)

  return (
    <div className="wrap pt-10 sec-b lg:pt-16">
      <h1 className="display text-[clamp(3rem,7vw,6.4rem)]">Leit</h1>
      <form
        role="search"
        className="mt-10 flex items-center gap-3 border-b border-charcoal pb-3"
        onSubmit={(e) => {
          e.preventDefault()
          const v = value.trim()
          setParams(v ? { q: v } : {})
        }}
      >
        <Search size={26} strokeWidth={1.3} aria-hidden className="shrink-0 text-muted" />
        <label htmlFor="q" className="sr-only">Leitarorð</label>
        <input
          ref={input}
          id="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Hverju ertu að leita að?"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.8rem,4vw,3rem)] outline-none placeholder:text-muted/60"
        />
        <button type="submit" className="btn btn-dark">Leita</button>
      </form>

      {!q && (
        <div className="mt-14 grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Vinsæl leitarorð</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}><Link className="chip" to={`/leit?q=${encodeURIComponent(s)}`}>{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Eða skoðaðu flokkana</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {topics.map((t) => <li key={t.slug}><Link className="chip" to={`/flokkur/${t.slug}`}>{t.name}</Link></li>)}
            </ul>
          </div>
        </div>
      )}

      {q && (
        <div className="mt-12">
          <p className="text-[15px] text-muted" aria-live="polite">
            {results.status === 'success'
              ? results.data.total
                ? <>{formatNumber(results.data.total)} niðurstöður fyrir <strong className="font-medium text-charcoal">„{q}“</strong></>
                : null
              : results.status === 'loading' ? 'Leita…' : null}
          </p>
          <div className="mt-10">
            {results.status === 'error' && <ErrorState error={results.error} />}
            {results.status === 'loading' && <CardSkeletons className="card-grid sm:grid-cols-2 lg:grid-cols-3" count={6} />}
            {results.status === 'success' && results.data.items.length === 0 && (
              <EmptyState title={`Ekkert fannst fyrir „${q}“`}>
                <p>Prófaðu annað orð eða styttri leit — t.d. „eldhús“ frekar en „eldhúsbreytingar“.</p>
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.slice(0, 5).map((s) => <li key={s}><Link className="chip" to={`/leit?q=${encodeURIComponent(s)}`}>{s}</Link></li>)}
                </ul>
              </EmptyState>
            )}
            {results.status === 'success' && results.data.items.length > 0 && (
              <>
                <ul className="card-grid sm:grid-cols-2 lg:grid-cols-3">
                  {results.data.items.map((a) => <li key={a.id}><ArticleCard article={a} /></li>)}
                </ul>
                <Pagination page={page} totalPages={results.data.totalPages} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
