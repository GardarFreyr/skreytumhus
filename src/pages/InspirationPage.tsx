import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useArticles } from '../features/articles/hooks'
import { useSeo } from '../lib/seo'
import { Img } from '../components/ui/Img'
import { Meta } from '../components/editorial/ArticleCard'
import { CardSkeletons, EmptyState, ErrorState } from '../components/ui/States'
import { INSPIRATION_DEFAULT_IDS, inspirationFilters } from '../data/taxonomy'

const PER_CHUNK = 9

/** Uppröðun hverrar 9-mynda lotu á 6 dálka grind: blanda af háum, breiðum og ferköntuðum myndum. */
const PATTERN = [
  { cls: 'col-span-6 md:col-span-4 md:row-span-2', ratio: '4 / 5' },
  { cls: 'col-span-3 md:col-span-2', ratio: '4 / 5' },
  { cls: 'col-span-3 md:col-span-2', ratio: '4 / 5' },
  { cls: 'col-span-3 md:col-span-2', ratio: '1 / 1' },
  { cls: 'col-span-3 md:col-span-2', ratio: '1 / 1' },
  { cls: 'col-span-6 md:col-span-2', ratio: '4 / 5' },
  { cls: 'col-span-6 md:col-span-3', ratio: '5 / 4' },
  { cls: 'col-span-3 md:col-span-3', ratio: '5 / 4' },
  { cls: 'col-span-3 md:hidden', ratio: '1 / 1' },
]

export default function InspirationPage() {
  const [params, setParams] = useSearchParams()
  const active = Number(params.get('flokkur')) || null
  const [chunks, setChunks] = useState(1)
  const cats = active ? [active] : INSPIRATION_DEFAULT_IDS
  const activeName = inspirationFilters.find((f) => f.id === active)?.name

  useSeo({
    title: activeName ? `Innblástur: ${activeName}` : 'Innblástur',
    description: 'Innlit, heimili Soffíu og innblástur úr safni Skreytum Hús — sjónræn uppgötvun fyrir heimilið.',
  })

  const pick = (id: number | null) => {
    setChunks(1)
    setParams(id ? { flokkur: String(id) } : {})
  }

  return (
    <div className="pb-32">
      <header className="wrap grid gap-8 pt-10 lg:grid-cols-12 lg:items-end lg:pt-16">
        <div className="lg:col-span-7">
          <p className="eyebrow">Sjónræn uppgötvun</p>
          <h1 className="display mt-5 text-[clamp(3.2rem,8vw,7.4rem)]">Innblástur</h1>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
          Innlit á falleg heimili, myndir úr heimili Soffíu og hugmyndir sem safnast hafa á bloggið í gegnum árin. Hver mynd leiðir í greinina á bak við hana.
        </p>
      </header>

      <nav aria-label="Sía eftir flokki" className="wrap mt-10">
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          <li><button type="button" className="chip whitespace-nowrap" aria-pressed={!active} onClick={() => pick(null)}>Allt</button></li>
          {inspirationFilters.map((f) => (
            <li key={f.id}>
              <button type="button" className="chip whitespace-nowrap" aria-pressed={active === f.id} onClick={() => pick(f.id)}>{f.name}</button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wrap mt-12 flex flex-col gap-3 sm:gap-4">
        {Array.from({ length: chunks }, (_, i) => (
          <Chunk key={`${cats.join()}-${i}`} cats={cats} page={i + 1} isLast={i === chunks - 1} onMore={() => setChunks((c) => c + 1)} />
        ))}
      </div>
    </div>
  )
}

function Chunk({ cats, page, isLast, onMore }: { cats: number[]; page: number; isLast: boolean; onMore: () => void }) {
  const state = useArticles({ categories: cats, page, perPage: PER_CHUNK })
  if (state.status === 'error') return <ErrorState error={state.error} />
  if (state.status === 'loading') return <CardSkeletons className="grid grid-cols-2 gap-4 md:grid-cols-3" count={6} ratio="1 / 1" />
  const { items, totalPages } = state.data
  if (!items.length && page === 1) return <EmptyState title="Ekkert hér enn" />

  return (
    <>
      <ul className="grid grid-flow-dense grid-cols-6 gap-3 sm:gap-4">
        {items.map((a, i) => {
          const p = PATTERN[i % PATTERN.length]
          return (
            <li key={a.id} className={p.cls}>
              <Link to={`/greinar/${a.slug}`} className="group relative block h-full overflow-hidden text-ivory">
                <Img pic={a.image} ratio={p.ratio} className="h-full" sizes="(min-width: 768px) 40vw, 100vw" priority={page === 1 && i === 0} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-90 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-4 transition-all duration-500 sm:p-6 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                  <Meta article={a} light />
                  <h2 className="display mt-2 text-[clamp(1.3rem,2vw,2rem)]">{a.title}</h2>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {isLast && page < totalPages && (
        <div className="mt-12 flex justify-center">
          <button type="button" className="btn btn-line" onClick={onMore}>Sýna meiri innblástur</button>
        </div>
      )}
    </>
  )
}
