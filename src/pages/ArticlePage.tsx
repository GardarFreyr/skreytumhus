import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useArticle, useRelated } from '../features/articles/hooks'
import { NotFoundError } from '../lib/wp'
import { useSeo } from '../lib/seo'
import { formatDate, readingMinutes } from '../lib/format'
import { plainText, truncate } from '../lib/html'
import { ArticleBody } from '../components/editorial/ArticleBody'
import { ArticleCard } from '../components/editorial/ArticleCard'
import { AdCluster, AdRail } from '../components/ads/Ads'
import { ShareBar } from '../components/editorial/ShareBar'
import { Img } from '../components/ui/Img'
import { ErrorState } from '../components/ui/States'
import NotFoundPage from './NotFoundPage'
import type { Article } from '../lib/types'

/** Ein grein. `variant="project"` er sama efni í framsetningu herbergisbreytinga. */
export default function ArticlePage({ variant = 'article' }: { variant?: 'article' | 'project' }) {
  const { slug } = useParams()
  const state = useArticle(slug)
  const a = state.data

  useSeo({
    title: a?.title,
    description: a ? truncate(a.excerpt || plainText(a.html), 155) : undefined,
    image: a?.image?.src,
    canonical: a?.link,
    type: 'article',
    jsonLd: a
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: a.title,
          datePublished: a.date,
          dateModified: a.modified,
          author: { '@type': 'Person', name: 'Soffía Dögg Garðarsdóttir' },
          publisher: { '@type': 'Organization', name: 'Skreytum Hús' },
          image: a.image?.src,
          mainEntityOfPage: a.link,
          inLanguage: 'is',
        }
      : undefined,
  })

  if (state.status === 'error') {
    return state.error instanceof NotFoundError ? <NotFoundPage /> : <ErrorState error={state.error} />
  }
  if (!a) return <ArticleSkeleton />
  return <ArticleView a={a} variant={variant} />
}

function ArticleView({ a, variant }: { a: Article; variant: 'article' | 'project' }) {
  const navigate = useNavigate()
  const related = useRelated(a.id, a.categories.map((c) => c.id))
  const minutes = readingMinutes(plainText(a.html))
  const isProject = variant === 'project'
  const back = isProject ? { to: '/herbergisbreytingar', label: 'Herbergisbreytingar' } : { to: '/greinar', label: 'Allar greinar' }

  return (
    <article>
      <div className="wrap pt-6 lg:pt-10">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(back.to))}
          className="inline-flex min-h-11 items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-muted hover:text-charcoal"
        >
          <ArrowLeft size={16} aria-hidden /> Til baka
        </button>
      </div>

      <header className={`wrap mt-6 grid gap-10 lg:mt-10 ${isProject ? '' : 'lg:grid-cols-12 lg:items-end lg:gap-14'}`}>
        <div className={isProject ? 'mx-auto max-w-4xl text-center' : 'lg:col-span-6'}>
          <p className="eyebrow">
            {isProject ? 'Herbergisbreyting' : a.categories.slice(0, 2).map((c, i) => (
              <span key={c.id}>{i > 0 && ' · '}<Link to={`/flokkur/${c.slug}`} className="link-u">{c.name}</Link></span>
            ))}
          </p>
          <h1 className="display mt-6 text-[clamp(2.7rem,6vw,5.8rem)]">{a.title}</h1>
          <p className={`mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-muted ${isProject ? 'justify-center' : ''}`}>
            <span>Eftir <span className="text-charcoal">{a.author}</span></span>
            <span aria-hidden>·</span>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            <span aria-hidden>·</span>
            <span>{minutes} mín. lestur</span>
          </p>
          {a.sponsored && (
            <p className="mt-6 inline-block border border-stone px-4 py-2 text-[13px] text-muted">
              <strong className="font-medium text-charcoal">Samstarf.</strong> Þessi færsla er merkt sem samstarf í upprunalega blogginu.
            </p>
          )}
        </div>
        {a.image && (
          <div className={isProject ? '' : 'lg:col-span-6'}>
            <Img pic={a.image} ratio={isProject ? '16 / 9' : '4 / 5'} sizes={isProject ? '100vw' : '(min-width:1024px) 48vw, 100vw'} priority />
          </div>
        )}
      </header>

      <div className="wrap mt-16 lg:mt-24 xl:grid xl:grid-cols-[minmax(0,1fr)_202px] xl:gap-16">
        <div className="min-w-0">
        <ArticleBody html={a.html} />

        <footer className="mx-auto mt-20 flex max-w-[680px] flex-col gap-8 border-t border-line pt-10">
          <ShareBar title={a.title} url={a.link} />
          {a.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Merki">
              {a.tags.slice(0, 8).map((t) => (
                <li key={t.id}><Link to={`/leit?q=${encodeURIComponent(t.name)}`} className="text-[13px] text-muted underline-offset-4 hover:underline">#{t.name}</Link></li>
              ))}
            </ul>
          )}
          <p className="text-[13.5px] text-muted">
            Upprunalega birt á skreytumhus.is{' '}
            <a href={a.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-charcoal underline underline-offset-4">
              Opna upprunalegu færsluna <ArrowUpRight size={14} aria-hidden />
            </a>
          </p>
        </footer>
        </div>
        {/* Auglýsingar: hliðarstika á stórum skjám */}
        <AdRail className="hidden xl:block" />
      </div>

      {/* Auglýsingar á minni skjám: á eftir greininni, áður en tengdar færslur koma */}
      <div className="wrap xl:hidden">
        <AdCluster className="mx-auto mt-20 max-w-[680px]" />
      </div>

      {related.data && related.data.items.length > 0 && (
        <section aria-labelledby="tengt" className="mt-32 bg-cream py-24">
          <div className="wrap">
            <h2 id="tengt" className="display text-[clamp(2.2rem,4vw,3.6rem)]">Þér gæti <em>líka líkað</em></h2>
            <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
              {related.data.items.map((r) => <ArticleCard key={r.id} article={r} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

function ArticleSkeleton() {
  return (
    <div className="wrap grid gap-10 pt-16 lg:grid-cols-12" aria-busy="true" aria-label="Hleð grein">
      <div className="lg:col-span-6">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton mt-6 h-28 w-full" />
        <div className="skeleton mt-6 h-4 w-60" />
      </div>
      <div className="skeleton lg:col-span-6" style={{ aspectRatio: '4 / 5' }} />
    </div>
  )
}
