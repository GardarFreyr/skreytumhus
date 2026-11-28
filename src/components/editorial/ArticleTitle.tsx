import { Fragment, type CSSProperties, type ReactNode } from 'react'

/**
 * Titill greinar í haus (WordPress-titill, hvaða lengd sem er).
 *
 * Titillinn má aldrei fara út fyrir dálkinn sinn (t.d. undir forsíðumyndina), aldrei styttast
 * og aldrei valda láréttu skruni. Íslensk samsett orð eru oft löng („Svefnherbergjainnblástur“),
 * svo þrjú lög vinna saman (sjá `.article-title` í index.css):
 *
 *  1. Leturstærð með clamp() sem miðast við breidd dálksins sjálfs (container query, `cqi`)
 *     *og* lengsta orð titilsins: venjulegir titlar halda fullri stærð, en titill með mjög löngu
 *     orði minnkar svo orðið passi – þó aldrei niður fyrir lesanlegt lágmark.
 *  2. `hyphens: auto` (lang="is") – vafrar með íslenska orðskiptingu skipta orðum fallega.
 *  3. `overflow-wrap: anywhere` – trygging: ef orð passar samt ekki brotnar það frekar en að
 *     fara út fyrir. Auk þess má brjóta línu á eftir „/“ (t.d. „TJ Maxx/Marshalls/Homegoods“).
 */
export function ArticleTitle({
  title,
  layout,
  className = '',
  render = (c) => c,
}: {
  title: string
  /** split = við hlið myndar · wide = miðjaður haus í fullri breidd · home = forsíðuhaus */
  layout: 'split' | 'wide' | 'home'
  className?: string
  /** T.d. til að gera titilinn að tengli; fær titilinn með leyfðum línubrotum */
  render?: (content: ReactNode) => ReactNode
}) {
  return (
    <div className={`article-title-box ${className}`}>
      <h1
        className={`display article-title article-title--${layout}`}
        style={{ '--title-chars': longestWord(title) } as CSSProperties}
      >
        {render(breakable(title))}
      </h1>
    </div>
  )
}

/** Fjöldi stafa í lengsta „orði“ (hluti sem ekki brotnar á bili, „/“ eða bandstriki). Lágmark 12. */
export function longestWord(title: string) {
  return Math.max(12, ...title.split(/[\s/–—-]+/u).map((w) => [...w].length))
}

/** Leyfir línubrot á eftir „/“ án þess að breyta textanum sjálfum. */
function breakable(title: string) {
  const bits = title.split('/')
  return bits.map((b, i) => (
    <Fragment key={i}>
      {b}
      {i < bits.length - 1 && <>/<wbr /></>}
    </Fragment>
  ))
}
