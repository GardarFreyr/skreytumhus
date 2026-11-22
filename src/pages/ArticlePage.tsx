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
import { HERO_MEDIA_CLASS, SplitHero } from '../components/layout/SplitHero'
import { ShareBar } from '../components/editorial/ShareBar'
import { LikeButton } from '../components/editorial/LikeButton'
import { ArticleNav } from '../components/editorial/ArticleNav'
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

      {(() => {
        const eyebrow = (
          <p className="eyebrow">
            {isProject ? 'Herbergisbreyting' : a.categories.slice(0, 2).map((c, i) => (
              <span key={c.id}>{i > 0 && ' · '}<Link to={`/flokkur/${c.slug}`} className="link-u">{c.name}</Link></span>
            ))}
          </p>
        )
        const meta = (
          <p className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-muted ${isProject ? 'justify-center' : ''}`}>
            <span>Eftir <span className="text-charcoal">{a.author}</span></span>
            <span aria-hidden>·</span>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            <span aria-hidden>·</span>
            <span>{minutes} mín. lestur</span>
            <LikeButton postId={a.id} size="sm" />
          </p>
        )
        const sponsored = a.sponsored && (
          <p className="mt-6 inline-block border border-stone px-4 py-2 text-[13px] text-muted">
            <strong className="font-medium text-charcoal">Samstarf.</strong> Þessi færsla er merkt sem samstarf í upprunalega blogginu.
          </p>
        )

        // Verkefni og greinar án myndar: miðjaður haus, mynd (ef til) í fullri breidd undir.
        if (isProject || !a.image) {
          return (
            <header data-hero className="wrap mt-6 lg:mt-8">
              <div className={`mx-auto max-w-4xl ${isProject ? 'text-center' : ''}`}>
                {eyebrow}
                <h1 className="display mt-5 text-[clamp(2.6rem,5.4vw,5.2rem)]">{a.title}</h1>
                {meta}
                {sponsored}
              </div>
              {a.image && (
                <div className="blk-mt">
                  <Img pic={a.image} ratio="16 / 9" sizes="100vw" priority className={HERO_MEDIA_CLASS} />
                </div>
              )}
            </header>
          )
        }

        // Grein með mynd: texti og mynd hlið við hlið, miðjuð saman — ekkert tómt svæði ofan við titil.
        return (
          <SplitHero
            label="Haus greinar"
            className="mt-6 lg:mt-8"
            media={<Img pic={a.image} ratio="4 / 3" sizes="(min-width:1024px) 56vw, 100vw" priority className={HERO_MEDIA_CLASS} />}
          >
            <header>
              {eyebrow}
              <h1 className="display mt-5 text-[clamp(2.5rem,4.4vw,4.6rem)]">{a.title}</h1>
              {meta}
              {sponsored}
            </header>
          </SplitHero>
        )
      })()}

      <div className="wrap blk-mt xl:grid xl:grid-cols-[minmax(0,1fr)_202px] xl:gap-16">
        <div className="min-w-0">
        <ArticleBody html={a.html} />

        <footer className="mx-auto blk-mt flex max-w-[680px] flex-col gap-8 border-t border-line pt-10">
          <LikeButton postId={a.id} />
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

        <ArticleNav article={a} />
        </div>
        {/* Auglýsingar: hliðarstika á stórum skjám */}
        <AdRail className="hidden xl:block" />
      </div>

      {/* Auglýsingar á minni skjám: á eftir greininni, áður en tengdar færslur koma */}
      <div className="wrap xl:hidden">
        <AdCluster className="mx-auto blk-mt max-w-[680px]" />
      </div>

      {related.data && related.data.items.length > 0 && (
        <section aria-labelledby="tengt" className="sec-mt sec-y bg-cream">
          <div className="wrap">
            <h2 id="tengt" className="display text-[clamp(2.2rem,4vw,3.6rem)]">Þér gæti <em>líka líkað</em></h2>
            <div className="card-grid blk-mt sm:grid-cols-3">
              {related.data.items.map((r) => <ArticleCard key={r.id} article={r} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

function ArticleSkeleton() {
  // Sama form og SplitHero-hausinn, svo ekkert hoppi þegar greinin hleðst
  return (
    <div aria-busy="true" aria-label="Hleð grein" className="min-h-[100svh]">
      <div className="wrap pt-6 lg:pt-10"><div className="skeleton h-11 w-28" /></div>
      <SplitHero
        className="mt-6 lg:mt-8"
        media={<div className={`skeleton w-full ${HERO_MEDIA_CLASS}`} style={{ aspectRatio: '4 / 3' }} />}
      >
        <div className="skeleton h-3 w-32" />
        <div className="skeleton mt-6 h-28 w-full" />
        <div className="skeleton mt-6 h-4 w-60" />
      </SplitHero>
    </div>
  )
}
