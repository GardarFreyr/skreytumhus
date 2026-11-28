import { Link } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { articlePath, useAdjacent } from '../../features/articles/hooks'
import { formatDate } from '../../lib/format'
import { Img, RATIO } from '../ui/Img'
import type { ArticleSummary } from '../../lib/types'

/**
 * „← Fyrri grein“ / „Næsta grein →“ neðst í grein: raunverulegu færslurnar á undan og eftir
 * í WordPress, eftir birtingardegi. Átt sem á enga færslu er einfaldlega ekki sýnd.
 */
export function ArticleNav({ article }: { article: { id: number; date: string } }) {
  const { previous: prev, next: nxt, loading } = useAdjacent(article)

  if (!loading && !prev && !nxt) return null
  return (
    <nav
      aria-label="Fleiri greinar"
      aria-busy={loading || undefined}
      className="mx-auto blk-mt grid max-w-[920px] border-y border-line md:min-h-[9.5rem] md:grid-cols-2"
    >
      {loading ? (
        <div className="skeleton h-[7.5rem] md:col-span-2 md:h-auto" aria-hidden />
      ) : (
        <>
          {prev && <Item a={prev} dir="prev" />}
          {nxt && <Item a={nxt} dir="next" />}
        </>
      )}
    </nav>
  )
}

function Item({ a, dir }: { a: ArticleSummary; dir: 'prev' | 'next' }) {
  const isNext = dir === 'next'
  return (
    <Link
      to={articlePath(a.slug)}
      rel={isNext ? 'next' : 'prev'}
      className={`group flex items-center gap-5 py-7 transition-colors duration-300 md:py-8 ${
        isNext
          ? 'border-t border-line md:col-start-2 md:flex-row-reverse md:border-l md:border-t-0 md:pl-10 md:text-right'
          : 'md:pr-10'
      }`}
    >
      {a.image && (
        <div className="w-[92px] shrink-0 overflow-hidden sm:w-[112px]">
          <Img pic={a.image} ratio={RATIO.CARD} sizes="112px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`eyebrow flex items-center gap-2 ${isNext ? 'md:justify-end' : ''}`}>
          {isNext ? (
            <>Næsta grein <ArrowRight size={14} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" /></>
          ) : (
            <><ArrowLeft size={14} aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transition-none" /> Fyrri grein</>
          )}
        </p>
        <p className="mt-2.5 font-display [overflow-wrap:anywhere] hyphens-auto text-[1.45rem] leading-[1.15] text-charcoal underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-300 group-hover:decoration-taupe md:text-[1.6rem]">
          {a.title}
        </p>
        <p className="mt-1.5 text-[13px] text-muted"><time dateTime={a.date}>{formatDate(a.date)}</time></p>
      </div>
    </Link>
  )
}
