import { Link } from 'react-router'
import type { ArticleSummary } from '../../lib/types'
import { formatDate } from '../../lib/format'
import { truncate } from '../../lib/html'
import { Img } from '../ui/Img'
import { articlePath } from '../../features/articles/hooks'

type Variant = 'lead' | 'medium' | 'small' | 'row' | 'overlay'

interface Props {
  article: ArticleSummary
  variant?: Variant
  priority?: boolean
  to?: string
  headingLevel?: 'h2' | 'h3'
  /** Stór grein: mynd hægra megin */
  flip?: boolean
}

export function Meta({ article, light = false }: { article: ArticleSummary; light?: boolean }) {
  const cat = article.categories[0]
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.2em] ${light ? 'text-ivory/85' : 'text-muted'}`}>
      {cat && <span className={light ? '' : 'text-taupe-ink'}>{cat.name}</span>}
      {cat && <span aria-hidden>·</span>}
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      {article.sponsored && (
        <span className={`rounded-full border px-2 py-0.5 tracking-[0.14em] ${light ? 'border-ivory/50' : 'border-stone'}`}>Samstarf</span>
      )}
    </p>
  )
}

/** Greinarspjald í nokkrum stærðum svo uppsetning verði tímaritsleg en ekki einsleit. */
export function ArticleCard({ article, variant = 'small', priority, to, headingLevel = 'h3', flip = false }: Props) {
  const H = headingLevel
  const href = to ?? articlePath(article.slug)

  if (variant === 'overlay') {
    return (
      <Link to={href} className="group relative block overflow-hidden text-ivory">
        <Img pic={article.image} ratio="4 / 5" sizes="(min-width: 1024px) 33vw, 90vw" priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/75 via-night/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <Meta article={article} light />
          <H className="display mt-3 text-[clamp(1.7rem,2.6vw,2.4rem)]"><span className="link-u">{article.title}</span></H>
        </div>
      </Link>
    )
  }

  if (variant === 'lead') {
    return (
      <Link to={href} className="group grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
        <div className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
          <Img pic={article.image} ratio="4 / 4.6" sizes="(min-width: 768px) 55vw, 100vw" priority={priority} />
        </div>
        <div className="md:col-span-5 md:pb-6">
          <Meta article={article} />
          <H className="display mt-4 text-[clamp(2.2rem,4vw,3.8rem)]"><span className="link-u">{article.title}</span></H>
          {article.excerpt && <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">{truncate(article.excerpt, 220)}</p>}
          <span className="mt-7 inline-block text-[12.5px] font-medium uppercase tracking-[0.16em]">Lesa greinina →</span>
        </div>
      </Link>
    )
  }

  if (variant === 'row') {
    return (
      <Link to={href} className="group grid grid-cols-[96px_1fr] items-center gap-5 sm:grid-cols-[140px_1fr]">
        <Img pic={article.image} ratio="1 / 1" sizes="140px" />
        <div>
          <Meta article={article} />
          <H className="mt-2 font-display text-[1.45rem] leading-tight"><span className="link-u">{article.title}</span></H>
        </div>
      </Link>
    )
  }

  const medium = variant === 'medium'
  return (
    <Link to={href} className="group flex flex-col gap-5">
      <Img
        pic={article.image}
        ratio={medium ? '5 / 4' : '4 / 5'}
        sizes={medium ? '(min-width: 1024px) 45vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'}
        priority={priority}
      />
      <div>
        <Meta article={article} />
        <H className={`display mt-3 ${medium ? 'text-[clamp(1.9rem,2.8vw,2.6rem)]' : 'text-[1.75rem] leading-[1.08]'}`}>
          <span className="link-u">{article.title}</span>
        </H>
        {article.excerpt && (
          <p className={`mt-3 text-[15.5px] leading-relaxed text-muted ${medium ? '' : 'line-clamp-3'}`}>{truncate(article.excerpt, medium ? 200 : 150)}</p>
        )}
      </div>
    </Link>
  )
}
