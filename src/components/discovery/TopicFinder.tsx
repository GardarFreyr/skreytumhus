import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Search, X } from 'lucide-react'
import { useTermIndex } from '../../features/articles/useTermIndex'
import { formatTermCount, searchTerms, termPath, type Term, type TermIndex } from '../../lib/terms'
import { POPULAR_TERM_KEYS } from '../../data/termGroups'
import { formatNumber } from '../../lib/format'

export function TermChip({ term, current }: { term: Term; current?: boolean }) {
  return (
    <Link to={termPath(term)} className="chip gap-2" aria-current={current ? 'page' : undefined}>
      {term.name}
      <span className="text-[12px] tabular-nums opacity-60" aria-label={`${formatTermCount(term)} greinar`}>{formatTermCount(term)}</span>
    </Link>
  )
}

/** Leitarreitur + niðurstöður. `query`/`setQuery` koma utan frá svo síðan geti síað aðra lista líka. */
export function TermSearch({ index, query, setQuery, showResults = true, className = '' }: {
  index?: TermIndex
  query: string
  setQuery: (q: string) => void
  showResults?: boolean
  className?: string
}) {
  const id = useId()
  const results = useMemo(() => (index ? searchTerms(index.terms, query) : []), [index, query])
  const active = query.trim().length > 0
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">Leita að efnisorði</label>
      <div className="relative">
        <Search size={20} strokeWidth={1.5} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leitaðu að efni, t.d. jól, eldhús eða málning…"
          autoComplete="off"
          enterKeyHint="search"
          className="h-14 w-full rounded-full border border-stone bg-white/70 pl-14 pr-14 text-[16px] outline-none transition-colors placeholder:text-muted/80 focus:border-charcoal sm:h-16 sm:text-[17px]"
        />
        {active && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full hover:bg-stone/50" aria-label="Hreinsa leit">
            <X size={18} aria-hidden />
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{active ? `${results.length} efnisorð fundust` : ''}</p>
      {showResults && active && (
        <div className="mt-5">
          {results.length ? (
            <ul className="flex flex-wrap gap-2">
              {results.map((t) => <li key={t.key}><TermChip term={t} /></li>)}
            </ul>
          ) : (
            <p className="text-[15px] text-muted">
              Ekkert efnisorð passar við „{query.trim()}“.{' '}
              <Link className="underline underline-offset-4" to={`/leit?q=${encodeURIComponent(query.trim())}`}>Leita í texta greina</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function PopularTerms({ index, className = '' }: { index: TermIndex; className?: string }) {
  const popular = POPULAR_TERM_KEYS.map((k) => index.byKey.get(k)).filter((t): t is Term => !!t)
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {popular.map((t) => <li key={t.key}><TermChip term={t} /></li>)}
    </ul>
  )
}

/** Fyrirferðarlítil útgáfa fyrir Greinar-síðuna: leit, vinsæl efni og tengill á alla skrána. */
export function TopicFinder() {
  const idx = useTermIndex()
  const [query, setQuery] = useState('')
  const index = idx.status === 'success' ? idx.data : undefined
  return (
    <section aria-labelledby="finna-efni" className="rounded-[2px] bg-cream px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow">Efnisorð</p>
          <h2 id="finna-efni" className="display mt-3 text-[clamp(2rem,3.6vw,3rem)]">Finndu eldra efni</h2>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted">
            Allir flokkar og merki bloggsins frá 2010, eins og í gamla merkjaskýinu – bara auðveldara að leita.
          </p>
        </div>
        <div className="lg:col-span-5 lg:text-right">
          <Link to="/efnisord" className="btn btn-line">
            {index ? `Öll efnisorð (${formatNumber(index.terms.length)})` : 'Öll efnisorð'} <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
      <TermSearch index={index} query={query} setQuery={setQuery} className="mt-8" />
      {!query.trim() && (
        <div className="mt-6 min-h-[6.5rem]">
          <p className="eyebrow mb-3">Vinsælt</p>
          {index ? <PopularTerms index={index} /> : idx.status === 'error' ? <p className="text-[14px] text-muted">Ekki tókst að sækja efnisorð.</p> : null}
        </div>
      )}
    </section>
  )
}
