import { Link, Navigate, useSearchParams } from 'react-router'
import { ArrowRight, Play } from 'lucide-react'
import { useArticles } from '../features/articles/hooks'
import { useAsync } from '../lib/useAsync'
import { fetchArchiveTotal } from '../lib/wp'
import { useSeo } from '../lib/seo'
import { formatDate, formatNumber } from '../lib/format'
import { truncate } from '../lib/html'
import { ArticleCard, Meta } from '../components/editorial/ArticleCard'
import { MagazineGrid } from '../components/editorial/MagazineGrid'
import { BeforeAfter } from '../components/editorial/BeforeAfter'
import { Img, RATIO } from '../components/ui/Img'
import { AdCluster, AdRail } from '../components/ads/Ads'
import { InstagramSection } from '../components/editorial/InstagramSection'
import { features } from '../data/features'
import { HERO_MEDIA_CLASS, SplitHero } from '../components/layout/SplitHero'
import { PhotoCaption } from '../components/ui/PhotoCaption'
import { CardSkeletons, ErrorState, SectionHeader } from '../components/ui/States'
import { topics } from '../data/taxonomy'
import { seasons } from '../data/tv'
import { featuredTransformation } from '../data/projects'
import { ARCHIVE_YEARS } from '../data/taxonomy'
import { site } from '../data/site'
import type { ArticleSummary } from '../lib/types'

const latestSeason = seasons[0]
const SPOTLIGHT_IDS = [...topics.map((t) => t.coverPostId), featuredTransformation.postId, ...latestSeason.episodes.map((e) => e.postId)]

export default function HomePage() {
  const [params] = useSearchParams()
  const legacyId = params.get('p')

  useSeo({
    description: 'Skreytingar og breytingar, fegrun heimilisins og það sem gleður. Íslenskt heimilisblogg Soffíu Daggar síðan 2010.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.liveUrl, inLanguage: 'is' },
  })

  const latest = useArticles({ perPage: 7 })
  const spotlight = useArticles({ include: SPOTLIGHT_IDS })
  const total = useAsync('archive-total', fetchArchiveTotal)

  // Gamlar slóðir: skreytumhus.is/?p=123
  if (legacyId) return <Navigate to={`/p/${legacyId}`} replace />

  const byId = new Map<number, ArticleSummary>((spotlight.data?.items ?? []).map((a) => [a.id, a]))

  return (
    <>
      <Hero state={latest} />

      <section aria-labelledby="nyjast" className="wrap sec-t">
        <SectionHeader eyebrow="Nýjast á blogginu" title={<>Nýjustu <em>færslurnar</em></>} id="nyjast">
          <Link to="/greinar" className="btn btn-line">Allar greinar <ArrowRight size={16} aria-hidden /></Link>
        </SectionHeader>
        <div className="blk-mt xl:grid xl:grid-cols-[minmax(0,1fr)_202px] xl:gap-16">
          <div className="min-w-0">
            {latest.status === 'success' ? (
              <MagazineGrid items={latest.data.items.slice(1, 7)} />
            ) : latest.status === 'error' ? (
              <ErrorState error={latest.error} />
            ) : (
              <CardSkeletons className="card-grid sm:grid-cols-3" count={3} />
            )}
          </div>
          {/* Auglýsingar: hliðarstika á stórum skjám, hólf milli efnishluta annars */}
          <AdRail className="hidden xl:block" />
        </div>
        <AdCluster className="blk-mt xl:hidden" />
      </section>

      <Topics byId={byId} />
      <Transformation article={byId.get(featuredTransformation.postId)} />
      {features.homeAbout && <MeetSoffia />}
      <TvTeaser byId={byId} loading={spotlight.status === 'loading'} />
      <InstagramSection />
      <ArchiveBand total={total.data} />
    </>
  )
}

function Hero({ state }: { state: ReturnType<typeof useArticles> }) {
  if (state.status === 'error') return <ErrorState error={state.error} />
  const [a, ...rest] = state.data?.items ?? []
  return (
    <SplitHero
      label="Forsíðugrein"
      className="pt-6 lg:pt-10"
      mediaFirstOnMobile
      media={
        a ? (
          <Link to={`/greinar/${a.slug}`} className="group block" tabIndex={-1} aria-hidden>
            <Img pic={a.image} ratio="5 / 4" sizes="(min-width: 1024px) 58vw, 100vw" priority className={`animate-fade ${HERO_MEDIA_CLASS}`} />
          </Link>
        ) : (
          <div className={`skeleton ${HERO_MEDIA_CLASS}`} style={{ aspectRatio: '5 / 4' }} />
        )
      }
    >
      {a ? (
        <div className="animate-rise">
          <Meta article={a} />
          <h1 className="display mt-5 text-[clamp(2.7rem,5vw,5.4rem)]">
            <Link to={`/greinar/${a.slug}`} className="hover:text-taupe-ink">{a.title}</Link>
          </h1>
          {a.excerpt && <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-muted">{truncate(a.excerpt, 220)}</p>}
          <Link to={`/greinar/${a.slug}`} className="btn btn-dark mt-8">Lesa greinina <ArrowRight size={16} aria-hidden /></Link>
        </div>
      ) : (
        <div aria-busy="true"><div className="skeleton h-3 w-40" /><div className="skeleton mt-6 h-24 w-full" /><div className="skeleton mt-6 h-20 w-4/5" /></div>
      )}
      {rest.length > 0 && (
        <div className="mt-10 hidden border-t border-line pt-6 2xl:block">
          <h2 className="eyebrow mb-5">Einnig nýlegt</h2>
          <ul className="space-y-4">
            {rest.slice(0, 2).map((r) => (
              <li key={r.id}><ArticleCard article={r} variant="row" /></li>
            ))}
          </ul>
        </div>
      )}
    </SplitHero>
  )
}

function Topics({ byId }: { byId: Map<number, ArticleSummary> }) {
  return (
    <section aria-labelledby="flokkar" className="sec-mt sec-y bg-cream">
      <div className="wrap">
        <SectionHeader eyebrow="Efnisflokkar" title={<>Hvar viltu <em>byrja?</em></>} id="flokkar">
          <p className="max-w-sm text-[16px] leading-relaxed text-muted">
            Sextán ár af skreytingum, breytingum og fegrun heimilisins, flokkað svo auðvelt sé að finna innblástur.
          </p>
        </SectionHeader>
        {/* Jafnstórar flísar; síðasta röð er miðjusett svo 5 flokkar haldist í jafnvægi á öllum breiddum */}
        <ul className="blk-mt flex flex-wrap justify-center gap-3 sm:gap-4">
          {topics.map((t, i) => {
            const cover = byId.get(t.coverPostId)
            return (
              <li key={t.slug} className="w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-4rem)/5)]">
                <Link to={`/flokkur/${t.slug}`} className="group relative block overflow-hidden text-white">
                  <Img pic={cover?.image} ratio={RATIO.TILE} sizes="(min-width:1280px) 20vw, (min-width:640px) 33vw, 50vw" />
                  <PhotoCaption className="[--scrim-fade:2.5rem] sm:[--scrim-fade:3rem] xl:px-6 xl:pb-6">
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/90">0{i + 1}</span>
                    <h3 className="display mt-1 flex min-h-[2lh] items-end text-[clamp(1.5rem,2vw,2.05rem)] font-medium [overflow-wrap:anywhere]">{t.name.replace("Herbergisbreytingar", "Herbergis\u00ADbreytingar")}</h3>
                    <p className="mt-2 line-clamp-2 hidden min-h-[2lh] max-w-xs text-[14px] font-medium leading-snug text-white xl:block">{t.description}</p>
                  </PhotoCaption>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Transformation({ article }: { article?: ArticleSummary }) {
  const href = article ? `/herbergisbreytingar/${article.slug}` : `/p/${featuredTransformation.postId}`
  return (
    <section aria-labelledby="breyting" className="wrap sec-y">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-6 xl:col-span-5">
          <BeforeAfter before={featuredTransformation.before} after={featuredTransformation.after} />
          <p className="mt-4 text-[13px] text-muted">Dragðu sleðann til að bera saman. Myndir úr færslunni sjálfri.</p>
        </div>
        <div className="lg:col-span-6 xl:col-span-6 xl:col-start-7">
          <p className="eyebrow">Herbergisbreyting · Fyrir og eftir</p>
          <h2 id="breyting" className="display mt-5 text-[clamp(2.6rem,5vw,4.8rem)]">{featuredTransformation.title}</h2>
          <p className="mt-4 text-[15px] text-muted">{featuredTransformation.place}{article && <> · <time dateTime={article.date}>{formatDate(article.date)}</time></>}</p>
          <blockquote className="mt-10 border-l border-taupe pl-6 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] italic leading-snug text-charcoal">
            „…{featuredTransformation.quote}“
          </blockquote>
          {article?.excerpt && <p className="mt-8 max-w-lg text-[16.5px] leading-[1.75] text-muted">{truncate(article.excerpt, 240)}</p>}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={href} className="btn btn-dark">Skoða verkefnið <ArrowRight size={16} aria-hidden /></Link>
            <Link to="/herbergisbreytingar" className="btn btn-line">Fleiri breytingar</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const PORTRAIT = 'https://www.skreytumhus.is/wp-content/uploads/2020/12/www.skreytumhus.is2020-09-25-18.20.152-500x889.jpg'

function MeetSoffia() {
  return (
    <section aria-labelledby="soffia" className="bg-stone/45 sec-y">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="frame" style={{ aspectRatio: '4 / 5' }}>
            <img src={PORTRAIT} alt="Soffía Dögg Garðarsdóttir brosir í ljósblárri skyrtu" loading="lazy" style={{ objectPosition: '50% 30%' }} />
          </div>
          <p className="absolute -bottom-5 right-5 bg-ivory px-5 py-3 font-display text-xl italic text-taupe-ink">Soffía Dögg — Dossa</p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow">Um mig</p>
          <h2 id="soffia" className="display mt-5 text-[clamp(2.5rem,4.6vw,4.4rem)]">
            Vertu velkomin á Skreytum Hús og <em className="text-taupe-ink">gaman að sjá þig hér</em>
          </h2>
          <div className="mt-8 max-w-xl space-y-5 text-[17px] leading-[1.8] text-ink">
            <p>
              „Skreytum Hús er íslenskt heimilisblogg sem að fjallar um skreytingar og breytingar, fegrun heimilis og almennt þá hluti sem að eru að gleðja mig að hverju sinni!“
            </p>
            <p className="text-muted">
              Soffía Dögg er garðyrkjufræðingur af blómaskreytingabraut og hefur unnið í blómaverslunum og heildsölum síðan 1999. Skreytum Hús hóf göngu sína í september 2010.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/um-mig" className="btn btn-dark">Lesa söguna <ArrowRight size={16} aria-hidden /></Link>
            <Link to="/samband" className="btn btn-line">Hafa samband</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function TvTeaser({ byId, loading }: { byId: Map<number, ArticleSummary>; loading: boolean }) {
  const eps = latestSeason.episodes.map((e) => ({ ...e, post: byId.get(e.postId) })).filter((e) => e.post)
  const [feature, ...others] = eps
  return (
    <section aria-labelledby="tv" className="bg-night sec-y text-ivory">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow !text-ivory/65">Skreytum Hús TV · Vísir og Stöð 2+</p>
            <h2 id="tv" className="display mt-5 text-[clamp(2.6rem,5.4vw,5rem)]">Fimmta <em className="text-sage">þáttaröðin</em></h2>
          </div>
          <p className="max-w-sm text-[15.5px] leading-relaxed text-ivory/70">{latestSeason.note}</p>
        </div>

        {loading && <div className="mt-14 aspect-video bg-ivory/5" aria-busy="true" />}
        {feature?.post && (
          <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-14">
            <article className="lg:col-span-7">
              <Link to={`/greinar/${feature.post.slug}`} className="group relative block">
                <Img pic={feature.post.image} ratio="16 / 10" sizes="(min-width:1024px) 58vw, 100vw" />
                <span className="absolute left-5 top-5 bg-ivory px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal">Þáttur {feature.episode}</span>
              </Link>
              <h3 className="display mt-7 text-[clamp(2rem,3.2vw,3rem)]">
                <Link to={`/greinar/${feature.post.slug}`} className="hover:text-sage">{feature.post.title}</Link>
              </h3>
              <p className="mt-3 text-[15.5px] text-ivory/70">{truncate(feature.post.excerpt, 180)}</p>
              {feature.watchUrl && (
                <a href={feature.watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-7">
                  <Play size={15} aria-hidden /> Horfa á Vísi
                </a>
              )}
            </article>
            <div className="lg:col-span-5">
              <p className="eyebrow mb-2 !text-ivory/60">Fleiri þættir í röðinni</p>
              <ul>
                {others.map((e) => (
                  <li key={e.postId} className="border-t border-ivory/15">
                    <Link to={`/greinar/${e.post!.slug}`} className="group grid grid-cols-[112px_1fr] items-center gap-5 py-4">
                      <Img pic={e.post!.image} ratio={RATIO.CARD} sizes="112px" />
                      <span>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-ivory/60">Þáttur {e.episode}</span>
                        <span className="mt-1 block font-display text-[1.45rem] leading-tight"><span className="link-u">{e.post!.title}</span></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/tv" className="btn btn-light mt-6">Allar þáttaraðir <ArrowRight size={16} aria-hidden /></Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ArchiveBand({ total }: { total?: number }) {
  return (
    <section aria-labelledby="safnid" className="wrap sec-y">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Safnið</p>
          <h2 id="safnid" className="display mt-5 text-[clamp(2.6rem,5vw,4.6rem)]">
            {total ? formatNumber(total) : '…'} færslur, <em className="text-taupe-ink">allt frá 2010</em>
          </h2>
          <form action="/leit" role="search" className="mt-10 flex gap-2">
            <label htmlFor="home-search" className="sr-only">Leita í safninu</label>
            <input id="home-search" name="q" type="search" required placeholder="Leita í safninu…" className="h-13 min-w-0 flex-1 rounded-full border border-stone bg-white/60 px-6 text-[16px] outline-none focus:border-charcoal" />
            <button type="submit" className="btn btn-dark">Leita</button>
          </form>
          <Link to="/efnisord" className="btn btn-line mt-4">
            Finna eftir efnisorðum <ArrowRight size={16} aria-hidden />
          </Link>
          <p className="mt-3 text-[14px] text-muted">Jól, eldhús, DIY, fyrir og eftir og hundruð annarra efnisorða.</p>
        </div>
        <nav aria-label="Greinar eftir árum" className="lg:col-span-6 lg:col-start-7">
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {ARCHIVE_YEARS.map((y) => (
              <li key={y}>
                <Link to={`/greinar?ar=${y}`} className="flex h-14 items-center justify-center border border-line font-display text-2xl transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory">
                  {y}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
