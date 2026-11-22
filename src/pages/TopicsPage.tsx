import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { fold, type Term } from '../lib/terms'
import { formatNumber } from '../lib/format'
import { TERM_GROUPS } from '../data/termGroups'
import { PopularTerms, TermChip, TermSearch } from '../components/discovery/TopicFinder'
import { useTermIndex } from '../features/articles/useTermIndex'
import { ErrorState } from '../components/ui/States'

/** Fyrsti stafur fyrir stafrófslistann (íslensk röð: Á á eftir A o.s.frv.) */
const initial = (name: string) => {
  const c = name.trim().charAt(0).toLocaleUpperCase('is')
  return /\p{L}/u.test(c) ? c : '#'
}

/**
 * /efnisord – öll efnisorð bloggsins (raunverulegir WordPress-flokkar og -merki):
 * leit, vinsæl efni, hópar og stafrófsröð.
 */
export default function TopicsPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true })
  const idx = useTermIndex()
  const index = idx.status === 'success' ? idx.data : undefined

  useSeo({ title: 'Efnisorð', description: 'Öll efnisorð Skreytum Hús: flokkar og merki frá 2010. Finndu greinar um jól, eldhús, DIY, fyrir og eftir og margt fleira.' })

  const letters = useMemo(() => {
    const m = new Map<string, Term[]>()
    index?.terms.forEach((t) => {
      const l = initial(t.name)
      m.set(l, [...(m.get(l) ?? []), t])
    })
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b, 'is'))
  }, [index])

  const groups = useMemo(
    () => TERM_GROUPS.map((g) => ({ ...g, terms: g.keys.map((k) => index?.byKey.get(k)).filter((t): t is Term => !!t) })).filter((g) => g.terms.length),
    [index],
  )

  const searching = query.trim().length > 0

  return (
    <div className="wrap pt-10 sec-b lg:pt-16">
      <Link to="/greinar" className="inline-flex min-h-11 items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-muted hover:text-charcoal">
        <ArrowLeft size={15} aria-hidden /> Allar greinar
      </Link>
      <header className="mt-6 grid gap-8 border-b border-line pb-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow">Safnið</p>
          <h1 className="display mt-5 text-[clamp(3rem,7vw,6.2rem)]">Efnisorð</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Hér eru allir flokkar og merki bloggsins frá 2010. Smelltu á efnisorð til að sjá allar greinar um það.
          </p>
        </div>
        <div className="lg:col-span-5 lg:text-right">
          {index && (
            <p className="font-display text-2xl italic text-taupe-ink">
              {formatNumber(index.terms.length)} efnisorð
              <span className="block text-[15px] not-italic text-muted">
                úr {formatNumber(index.categoryCount)} flokkum og {formatNumber(index.tagCount)} merkjum
              </span>
            </p>
          )}
        </div>
      </header>

      <TermSearch index={index} query={query} setQuery={setQuery} className="blk-mt max-w-3xl" />

      {idx.status === 'error' ? (
        <div className="blk-mt"><ErrorState error={idx.error} /></div>
      ) : !index ? (
        <div className="blk-mt min-h-[60svh]" aria-busy="true" />
      ) : !searching ? (
        <>
          <section aria-labelledby="vinsaelt" className="blk-mt">
            <h2 id="vinsaelt" className="eyebrow mb-4">Vinsælt</h2>
            <PopularTerms index={index} />
          </section>

          <section aria-labelledby="hopar" className="sec-mt">
            <h2 id="hopar" className="display text-[clamp(2rem,3.4vw,2.8rem)]">Eftir efni</h2>
            <div className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((g) => (
                <div key={g.title} className="border-t border-line pt-5">
                  <h3 className="font-display text-[1.6rem] leading-tight">{g.title}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {g.terms.map((t) => <li key={t.key}><TermChip term={t} /></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="stafrof" className="sec-mt">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="stafrof" className="display text-[clamp(2rem,3.4vw,2.8rem)]">Öll efnisorð A–Ö</h2>
              <p className="text-[13px] text-muted">Talan sýnir fjölda greina. „+“: efnisorðið er bæði flokkur og merki.</p>
            </div>
            <nav aria-label="Stafir" className="mt-6 flex flex-wrap gap-1">
              {letters.map(([l]) => (
                <a key={l} href={`#staf-${fold(l) || l}`} className="grid size-11 place-items-center rounded-full font-display text-xl hover:bg-stone/50">{l}</a>
              ))}
            </nav>
            <div className="mt-8 columns-1 gap-10 sm:columns-2 lg:columns-3 xl:columns-4">
              {letters.map(([l, terms]) => (
                <div key={l} id={`staf-${fold(l) || l}`} className="mb-8 break-inside-avoid scroll-mt-32">
                  <h3 className="border-b border-line pb-2 font-display text-3xl">{l}</h3>
                  <ul className="mt-2">
                    {terms.map((t) => (
                      <li key={t.key}>
                        <Link to={`/efni/${t.key}`} className="group flex min-h-10 items-baseline justify-between gap-4 py-1.5 text-[15px] hover:text-taupe-ink">
                          <span className="link-u">{t.name}</span>
                          <span className="shrink-0 text-[12.5px] tabular-nums text-muted">{t.count}{t.merged ? '+' : ''}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
