import { Link } from 'react-router'
import { ArrowRight, Mail } from 'lucide-react'
import { projectPath, useArticles } from '../features/articles/hooks'
import { useSeo } from '../lib/seo'
import { formatDate } from '../lib/format'
import { truncate } from '../lib/html'
import { BeforeAfter } from '../components/editorial/BeforeAfter'
import { ArticleCard } from '../components/editorial/ArticleCard'
import { Img, RATIO } from '../components/ui/Img'
import { PhotoCaption } from '../components/ui/PhotoCaption'
import { CardSkeletons, ErrorState } from '../components/ui/States'
import { archiveProjectIds, featuredTransformation } from '../data/projects'
import { BEFORE_AFTER_CATEGORY_ID } from '../data/taxonomy'
import { site } from '../data/site'

export default function ProjectsPage() {
  useSeo({
    title: 'Herbergisbreytingar',
    description: 'Raunverulegar herbergisbreytingar Soffíu Daggar: barnaherbergi, stofur, svefnherbergi og fyrirtæki — fyrir og eftir.',
  })
  const recent = useArticles({ categories: [BEFORE_AFTER_CATEGORY_ID], perPage: 7 })
  const archive = useArticles({ include: archiveProjectIds })

  const [lead, ...rest] = recent.data?.items ?? []

  return (
    <div className="sec-b">
      <header className="wrap pt-10 lg:pt-16">
        <p className="eyebrow">Verkefni · Fyrir og eftir</p>
        <h1 className="display mt-5 max-w-5xl text-[clamp(3rem,8vw,7.4rem)]">Herbergis&shy;breytingar</h1>
        <div className="mt-10 grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
          <blockquote className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] italic leading-snug text-charcoal lg:col-span-7">
            „Ég hef verið að taka það að mér að breyta herbergjum. Hér sjást nokkur þeirra hér fyrir neðan.“
          </blockquote>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[15.5px] leading-relaxed text-muted">
              Langar þig í aðstoð við svona verkefni? Soffía tekur við fyrirspurnum í tölvupósti.
            </p>
            <a href={`mailto:${site.email}?subject=${encodeURIComponent('Fyrirspurn um herbergisbreytingu')}`} className="btn btn-dark mt-5">
              <Mail size={16} aria-hidden /> Senda fyrirspurn
            </a>
          </div>
        </div>
      </header>

      {/* Staðfest fyrir/eftir */}
      <section aria-labelledby="ba" className="sec-mt sec-y bg-cream">
        <div className="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <BeforeAfter before={featuredTransformation.before} after={featuredTransformation.after} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">Nýlegt verkefni</p>
            <h2 id="ba" className="display mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)]">{featuredTransformation.title}</h2>
            <p className="mt-4 text-muted">{featuredTransformation.place}</p>
            <p className="mt-8 font-display text-2xl italic text-taupe-ink">„…{featuredTransformation.quote}“</p>
            <Link to={`/p/${featuredTransformation.postId}`} className="btn btn-dark mt-10">Lesa um verkefnið <ArrowRight size={16} aria-hidden /></Link>
          </div>
        </div>
      </section>

      {/* Nýleg verkefni úr flokknum Fyrir/eftir */}
      <section aria-labelledby="nyleg" className="wrap sec-mt">
        <h2 id="nyleg" className="display text-[clamp(2.4rem,5vw,4.6rem)]">Nýlegar <em>breytingar</em></h2>
        <div className="mt-14">
          {recent.status === 'error' && <ErrorState error={recent.error} />}
          {recent.status === 'loading' && <CardSkeletons className="card-grid sm:grid-cols-3" count={3} />}
          {lead && (
            <div className="flex flex-col gap-20">
              <Link to={projectPath(lead.slug)} className="group relative block text-ivory">
                <Img pic={lead.image} ratio="16 / 9" sizes="100vw" />
                <PhotoCaption className="max-md:!hidden !px-6 !pb-6 sm:!px-10 sm:!pb-10 lg:!px-14 lg:!pb-14 [--scrim-fade:7rem]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/90"><time dateTime={lead.date}>{formatDate(lead.date)}</time></p>
                  <h3 className="display mt-3 max-w-3xl text-[clamp(2rem,4.6vw,4.6rem)]">{lead.title}</h3>
                  <p className="mt-4 hidden max-w-xl text-[16px] text-white md:block">{truncate(lead.excerpt, 200)}</p>
                </PhotoCaption>
                {/* Á síma er myndin of lág fyrir texta ofan á henni: textinn fer undir myndina */}
                <div className="mt-5 text-charcoal md:hidden">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted"><time dateTime={lead.date}>{formatDate(lead.date)}</time></p>
                  <h3 className="display mt-2 text-[2rem]"><span className="link-u">{lead.title}</span></h3>
                </div>
              </Link>
              <div className="card-grid sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => <ArticleCard key={a.id} article={a} to={projectPath(a.slug)} />)}
              </div>
              <Link to="/flokkur/fyrireftir" className="btn btn-line self-center">Allar fyrir/eftir-færslur <ArrowRight size={16} aria-hidden /></Link>
            </div>
          )}
        </div>
      </section>

      {/* Verkefnin sem Soffía raðaði sjálf á síðuna Herbergisbreytingar */}
      <section aria-labelledby="safn" className="wrap sec-mt border-t border-line blk-pt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="safn" className="display text-[clamp(2.4rem,5vw,4.6rem)]">Úr <em>safninu</em></h2>
          <p className="max-w-md text-[15px] text-muted">Herbergin sem Soffía valdi sjálf á upprunalegu síðuna, frá 2011 til 2017.</p>
        </div>
        <div className="mt-14">
          {archive.status === 'error' && <ErrorState error={archive.error} />}
          {archive.status === 'loading' && <CardSkeletons className="card-grid grid-cols-2 lg:grid-cols-4" count={8} />}
          {archive.data && (
            <ul className="card-grid grid-cols-2 lg:grid-cols-4">
              {archive.data.items.map((a) => (
                <li key={a.id}>
                  <Link to={projectPath(a.slug)} className="group block">
                    <Img pic={a.image} ratio={RATIO.CARD} sizes="(min-width:1024px) 25vw, 50vw" />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted"><time dateTime={a.date}>{new Date(a.date).getFullYear()}</time></p>
                    <h3 className="mt-1 font-display text-[1.4rem] leading-tight"><span className="link-u">{a.title}</span></h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
