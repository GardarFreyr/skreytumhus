import type { ArticleSummary } from '../../lib/types'
import { ArticleCard } from './ArticleCard'

/**
 * Tímaritsleg uppröðun í föstum grindum: hverjar sex greinar mynda „opnu“ —
 * ein aðalgrein (mynd + texti), tveggja dálka röð og þriggja dálka röð.
 * Öll spjöld nota 4:3 myndir í sömu grind (.card-grid), svo myndir í sömu röð
 * eru jafnháar og byrja og enda á sama stað. Engin spjöld eru hliðruð eða teygð.
 */
export function MagazineGrid({ items, linkFor, firstPriority = false }: { items: ArticleSummary[]; linkFor?: (a: ArticleSummary) => string; firstPriority?: boolean }) {
  const spreads: ArticleSummary[][] = []
  for (let i = 0; i < items.length; i += 6) spreads.push(items.slice(i, i + 6))

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      {spreads.map((s, si) => {
        const [lead, ...rest] = s
        const pair = rest.slice(0, 2)
        const trio = rest.slice(2)
        return (
          <div key={lead.id} className="flex flex-col gap-14 lg:gap-16">
            <ArticleCard article={lead} variant="lead" flip={si % 2 === 1} priority={firstPriority && si === 0} to={linkFor?.(lead)} headingLevel="h2" />
            {pair.length > 0 && (
              <div className="card-grid sm:grid-cols-2">
                {pair.map((a) => <ArticleCard key={a.id} article={a} variant="medium" to={linkFor?.(a)} />)}
              </div>
            )}
            {trio.length > 0 && (
              <div className="card-grid sm:grid-cols-3">
                {trio.map((a) => <ArticleCard key={a.id} article={a} to={linkFor?.(a)} />)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
