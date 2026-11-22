import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, X } from 'lucide-react'
import { useArticles } from '../features/articles/hooks'
import { useAsync } from '../lib/useAsync'
import { fetchCategoryById, fetchCategoryBySlug, NotFoundError } from '../lib/wp'
import { useSeo } from '../lib/seo'
import { formatNumber } from '../lib/format'
import { MagazineGrid } from '../components/editorial/MagazineGrid'
import { Pagination } from '../components/ui/Pagination'
import { CardSkeletons, EmptyState, ErrorState } from '../components/ui/States'
import { ARCHIVE_YEARS, topicBySlug, topics } from '../data/taxonomy'
import NotFoundPage from './NotFoundPage'
import { TopicFinder } from '../components/discovery/TopicFinder'
import { useTermIndex } from '../features/articles/useTermIndex'
import { formatTermCount } from '../lib/terms'

const PER_PAGE = 12

/**
 * /greinar               – allar greinar, nýjast fyrst
 * /greinar?ar=2019       – eftir ári
 * /flokkur/<efnisflokkur> – efnisflokkur (safn WordPress-flokka)
 * /flokkur/<wp-slug>     – hvaða WordPress-flokkur sem er
 * /flokkur/id/<id>       – gamlar ?cat= slóðir
 * Síðuskipting með ?sida=
 */
export default function ArticlesPage() {
  const { slug, id, term: termKeyParam } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('sida')) || 1)
  const year = Number(params.get('ar')) || undefined

  const topic = slug ? topicBySlug(slug) : undefined
  // WordPress-flokkur sem er ekki efnisflokkur
  const wpCat = useAsync(
    slug && !topic ? `cat:${slug}` : id ? `cat-id:${id}` : null,
    (signal) => (id ? fetchCategoryById(Number(id), signal) : fetchCategoryBySlug(slug!, signal)),
  )

  // Efnisorð úr efnisorðaskránni (/efni/<lykill>): raunverulegir flokkar og/eða merki
  const termIdx = useTermIndex()
  const term = termKeyParam && termIdx.status === 'success' ? termIdx.data.byKey.get(termKeyParam) : undefined
  const termMissing = !!termKeyParam && termIdx.status === 'success' && !term

  const categoryIds = term ? term.categoryIds : topic ? topic.categoryIds : wpCat.data ? [wpCat.data.id] : undefined
  const tagIds = term?.tagIds.length ? term.tagIds : undefined
  const ready = termKeyParam ? !!term : !(slug || id) || topic || wpCat.status === 'success'
  const list = useArticles(
    ready ? { page, perPage: PER_PAGE, categories: categoryIds?.length ? categoryIds : undefined, tags: tagIds, taxRelation: 'OR', year } : null,
  )

  const isArchive = !slug && !id && !termKeyParam
  const title = termKeyParam && !term ? '…' : term?.name ?? topic?.name ?? wpCat.data?.name ?? (year ? `Greinar frá ${year}` : 'Greinar')
  useSeo({
    title: page > 1 ? `${title} – síða ${page}` : title,
    description: topic?.description ?? 'Allar greinar Skreytum Hús, nýjasta efnið fyrst. Skreytingar, breytingar, innlit og DIY síðan 2010.',
  })

  if ((wpCat.status === 'error' && wpCat.error instanceof NotFoundError) || termMissing) return <NotFoundPage />

  const setYear = (y?: number) => {
    const next = new URLSearchParams(params)
    next.delete('sida')
    if (y) next.set('ar', String(y))
    else next.delete('ar')
    setParams(next)
  }

  const basePath = (s?: string) => (s ? `/flokkur/${s}` : '/greinar')
  const yearQs = year ? `?ar=${year}` : ''

  return (
    <div className="wrap pt-10 sec-b lg:pt-16">
      {termKeyParam && (
        <nav aria-label="Til baka" className="-mt-2 mb-6 flex flex-wrap gap-x-6">
          <Link to="/greinar" className="inline-flex min-h-11 items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-muted hover:text-charcoal"><ArrowLeft size={15} aria-hidden /> Allar greinar</Link>
          <Link to="/efnisord" className="inline-flex min-h-11 items-center text-[13px] uppercase tracking-[0.14em] text-muted hover:text-charcoal">Öll efnisorð</Link>
        </nav>
      )}
      <header className="grid gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow">{termKeyParam ? 'Efnisorð' : topic || wpCat.data ? 'Flokkur' : 'Bloggið'}</p>
          <h1 className="display mt-5 text-[clamp(3rem,7vw,6.6rem)]">{title}</h1>
          {topic && <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">{topic.description}</p>}
        </div>
        <div className="lg:col-span-5 lg:text-right">
          {list.status === 'success' && (
            <p className="font-display text-2xl italic text-taupe-ink" aria-live="polite">
              {formatNumber(list.data.total)} {list.data.total === 1 ? 'grein' : 'greinar'}
              {page > 1 && <span className="not-italic text-muted"> · síða {page} af {formatNumber(list.data.totalPages)}</span>}
            </p>
          )}
        </div>
      </header>

      {isArchive && !year && page === 1 && <div className="blk-mt"><TopicFinder /></div>}

      {/* Síur */}
      <div className="mt-8 flex flex-col gap-5">
        <nav aria-label="Efnisflokkar" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            <li><Link to={`${basePath()}${yearQs}`} className="chip" aria-current={isArchive ? "page" : undefined}>Allt</Link></li>
            {topics.map((t) => (
              <li key={t.slug}><Link to={`${basePath(t.slug)}${yearQs}`} className="chip" aria-current={slug === t.slug ? 'page' : undefined}>{t.name}</Link></li>
            ))}
            {term && (
              <li><span className="chip gap-2" aria-current="page">{term.name}<span className="text-[12px] opacity-70">{formatTermCount(term)}</span></span></li>
            )}
            <li><Link to="/efnisord" className="chip">Öll efnisorð…</Link></li>
            {wpCat.data && !topic && (
              <li><span className="chip" aria-current="page">{wpCat.data.name}</span></li>
            )}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="year" className="eyebrow">Ár</label>
          <select
            id="year"
            value={year ?? ''}
            onChange={(e) => setYear(Number(e.target.value) || undefined)}
            className="h-11 rounded-full border border-stone bg-transparent pl-4 pr-10 text-[14px]"
          >
            <option value="">Öll ár</option>
            {ARCHIVE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-[13px] text-muted">Raðað: nýjast fyrst</span>
          {year && (
            <button type="button" onClick={() => setYear()} className="inline-flex min-h-11 items-center gap-1 text-[13px] underline underline-offset-4">
              <X size={14} aria-hidden /> Hreinsa ár
            </button>
          )}
        </div>
      </div>

      <div className="mt-16 lg:mt-20">
        {list.status === 'error' ? (
          <ErrorState error={list.error} />
        ) : list.status !== 'success' ? (
          <CardSkeletons className="card-grid sm:grid-cols-3" count={6} />
        ) : list.data.items.length === 0 ? (
          <EmptyState title="Engar greinar hér">
            <p>Prófaðu annan flokk eða annað ár, eða <Link className="underline" to="/leit">leitaðu í safninu</Link>.</p>
          </EmptyState>
        ) : (
          <>
            <MagazineGrid items={list.data.items} firstPriority />
            <Pagination page={page} totalPages={list.data.totalPages} />
          </>
        )}
      </div>
    </div>
  )
}
