import type { ArticleSummary } from '../../lib/types'
import { ArticleCard } from './ArticleCard'

/**
 * Tímaritsleg uppröðun: hver sex greinar mynda „opnu“ —
 * ein stór, tvær meðalstórar og þrjár minni — svo listinn verði aldrei einsleitur.
 */
export function MagazineGrid({ items, linkFor, firstPriority = false }: { items: ArticleSummary[]; linkFor?: (a: ArticleSummary) => string; firstPriority?: boolean }) {
  const spreads: ArticleSummary[][] = []
  for (let i = 0; i < items.length; i += 6) spreads.push(items.slice(i, i + 6))

  return (
    <div className="flex flex-col gap-24 md:gap-32">
      {spreads.map((s, si) => {
        const [lead, m1, m2, ...small] = s
        const flip = si % 2 === 1
        return (
          <div key={lead.id} className="flex flex-col gap-16 md:gap-24">
            <ArticleCard article={lead} variant="lead" flip={flip} priority={firstPriority && si === 0} to={linkFor?.(lead)} headingLevel="h2" />
            {(m1 || m2) && (
              <div className="grid gap-14 md:grid-cols-2 md:gap-10 lg:gap-16">
                {m1 && <ArticleCard article={m1} variant="medium" to={linkFor?.(m1)} />}
                {m2 && <div className="md:pt-24"><ArticleCard article={m2} variant="medium" to={linkFor?.(m2)} /></div>}
              </div>
            )}
            {small.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-12 [&>*:nth-child(3)]:max-lg:col-span-2">
                {small.map((a) => <ArticleCard key={a.id} article={a} to={linkFor?.(a)} />)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
