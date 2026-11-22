import { Link } from 'react-router'
import { ArrowUpRight, Play } from 'lucide-react'
import { useArticles } from '../features/articles/hooks'
import { useSeo } from '../lib/seo'
import { formatDate } from '../lib/format'
import { truncate } from '../lib/html'
import { Img, RATIO } from '../components/ui/Img'
import { CardSkeletons, ErrorState } from '../components/ui/States'
import { diyClips, seasons, TV_SERIES_URL, type Episode } from '../data/tv'
import type { ArticleSummary } from '../lib/types'

const ALL_IDS = [...seasons.flatMap((s) => s.episodes.map((e) => e.postId)), ...diyClips.map((e) => e.postId)]

export default function TvPage() {
  useSeo({
    title: 'Skreytum Hús TV',
    description: 'Allar fimm þáttaraðir Skreytum Hús á Vísi og Stöð 2+, með bloggfærslu um hvern þátt.',
  })
  const posts = useArticles({ include: ALL_IDS })
  const byId = new Map<number, ArticleSummary>((posts.data?.items ?? []).map((a) => [a.id, a]))
  const feature = seasons[0].episodes[0]
  const featurePost = byId.get(feature.postId)

  return (
    <div className="bg-night sec-b text-ivory">
      <header className="wrap pt-10 lg:pt-16">
        <p className="eyebrow !text-ivory/65">Sjónvarpsþættirnir</p>
        <h1 className="display mt-5 text-[clamp(3.2rem,8vw,7.4rem)]">Skreytum Hús <em className="text-sage">TV</em></h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ivory/75">
          Fimm þáttaraðir þar sem Soffía breytir herbergjum hjá fólki, sýndar á Vísi og Stöð 2+. Hér er hver þáttur með bloggfærslunni sem fylgdi honum — og tengillinn sem Soffía birti til að horfa.
        </p>
      </header>

      {posts.status === 'error' && <ErrorState error={posts.error} />}
      {posts.status === 'loading' && <div className="wrap mt-14"><div className="aspect-video bg-ivory/5" aria-busy="true" /></div>}

      {featurePost && (
        <section aria-labelledby="nyjasti" className="wrap blk-mt grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <Link to={`/greinar/${featurePost.slug}`} className="group relative block lg:col-span-8">
            <Img pic={featurePost.image} ratio="16 / 9" sizes="(min-width:1024px) 66vw, 100vw" priority />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-20 place-items-center rounded-full bg-ivory/90 text-charcoal transition-transform duration-500 group-hover:scale-110 lg:size-24"><Play size={28} aria-hidden /></span>
            </span>
          </Link>
          <div className="lg:col-span-4">
            <p className="eyebrow !text-ivory/65">Nýjasti þátturinn · Þáttaröð {feature.season}, þáttur {feature.episode}</p>
            <h2 id="nyjasti" className="display mt-4 text-[clamp(2.2rem,3.6vw,3.4rem)]">{featurePost.title}</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ivory/70">{truncate(featurePost.excerpt, 200)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={feature.watchUrl ?? TV_SERIES_URL} target="_blank" rel="noopener noreferrer" className="btn bg-ivory text-charcoal hover:bg-sage">
                <Play size={15} aria-hidden /> Horfa á Vísi
              </a>
              <Link to={`/greinar/${featurePost.slug}`} className="btn btn-light">Lesa færsluna</Link>
            </div>
          </div>
        </section>
      )}

      {posts.data &&
        seasons.map((s) => (
          <section key={s.number} aria-labelledby={`s${s.number}`} className="wrap sec-mt border-t border-ivory/15 pt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id={`s${s.number}`} className="display text-[clamp(2.2rem,4vw,3.6rem)]">Þáttaröð {s.number}</h2>
              <p className="text-[13px] uppercase tracking-[0.2em] text-ivory/60">{s.year} · {s.episodes.length} þættir</p>
            </div>
            <ol className="card-grid mt-10 sm:grid-cols-2 lg:grid-cols-3">
              {[...s.episodes].sort((a, b) => a.episode - b.episode).map((e) => (
                <EpisodeCard key={e.postId} e={e} post={byId.get(e.postId)} />
              ))}
            </ol>
          </section>
        ))}

      {posts.data && (
        <section aria-labelledby="diy" className="wrap sec-mt border-t border-ivory/15 pt-12">
          <h2 id="diy" className="display text-[clamp(2.2rem,4vw,3.6rem)]">Stuttir <em className="text-sage">DIY-þættir</em></h2>
          <ul className="card-grid mt-10 grid-cols-2 lg:grid-cols-4">
            {diyClips.map((e) => <EpisodeCard key={e.postId} e={e} post={byId.get(e.postId)} compact />)}
          </ul>
        </section>
      )}

      {posts.status === 'loading' && <div className="wrap mt-20"><CardSkeletons className="card-grid sm:grid-cols-3" count={3} /></div>}

      <aside className="wrap sec-mt">
        <div className="border border-ivory/20 p-8 sm:p-12">
          <p className="eyebrow !text-ivory/65">Um áhorf</p>
          <p className="mt-4 max-w-3xl text-[15.5px] leading-relaxed text-ivory/75">
            Þættirnir eru hýstir hjá Vísi og Stöð 2+. Myndböndin eru ekki felld inn hér þar sem ekki liggur fyrir heimild til þess; tenglarnir opna þáttinn hjá Vísi. Fyrir 5. þáttaröð vísaði Soffía á þáttasíðuna sjálfa, og fyrir 4. þátt 3. þáttaraðar fannst enginn áhorfstengill.
          </p>
          <a href={TV_SERIES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-8">
            Skreytum Hús á Vísi <ArrowUpRight size={16} aria-hidden />
          </a>
        </div>
      </aside>
    </div>
  )
}

function EpisodeCard({ e, post, compact = false }: { e: Episode; post?: ArticleSummary; compact?: boolean }) {
  if (!post) return null
  return (
    <li className="flex flex-col">
      <Link to={`/greinar/${post.slug}`} className="group block">
        <Img pic={post.image} ratio={RATIO.CARD} sizes="(min-width:1024px) 30vw, 50vw" />
        {!compact && <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-ivory/60">Þáttur {e.episode} · <time dateTime={post.date}>{formatDate(post.date)}</time></p>}
        <h3 className={`mt-2 font-display leading-tight ${compact ? 'mt-4 text-[1.35rem]' : 'text-[1.7rem]'}`}><span className="link-u">{post.title}</span></h3>
      </Link>
      {e.watchUrl ? (
        <a href={e.watchUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-[12.5px] font-medium uppercase tracking-[0.16em] text-sage hover:text-ivory">
          <Play size={13} aria-hidden /> Horfa á Vísi <span className="sr-only">— {post.title}</span>
        </a>
      ) : (
        <p className="mt-4 text-[12.5px] text-ivory/50">Áhorfstengill fannst ekki í færslunni</p>
      )}
    </li>
  )
}
