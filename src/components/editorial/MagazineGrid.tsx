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
        // Síðasta opnan getur verið styttri: raðir eru jafnaðar svo ekkert spjald standi eitt
        // (1 → önnur aðalgrein, 2 → par, 3 → þrenna, 4 → par + par, 5 → par + þrenna)
        const rows: ArticleSummary[][] = rest.length === 4 ? [rest.slice(0, 2), rest.slice(2)] : rest.length > 2 ? [rest.slice(0, rest.length - 3), rest.slice(-3)].filter((r) => r.length) : rest.length === 2 ? [rest] : []
        const single = rest.length === 1 ? rest[0] : undefined
        return (
          <div key={lead.id} className="flex flex-col gap-14 lg:gap-16">
            <ArticleCard article={lead} variant="lead" flip={si % 2 === 1} priority={firstPriority && si === 0} to={linkFor?.(lead)} headingLevel="h2" />
            {single && <ArticleCard article={single} variant="lead" flip={si % 2 === 0} to={linkFor?.(single)} headingLevel="h2" />}
            {rows.map((row) => (
              <div key={row[0].id} className={`card-grid ${row.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {row.map((a) => <ArticleCard key={a.id} article={a} variant={row.length === 3 ? undefined : 'medium'} to={linkFor?.(a)} />)}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
