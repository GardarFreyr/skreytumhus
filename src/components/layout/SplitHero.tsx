import type { ReactNode } from 'react'

/**
 * Tvískiptur „hero“: mynd (7/12) og texti (5/12), lóðrétt miðjað saman.
 *
 * Reglur (svo ekki myndist tómt svæði við hlið myndar):
 * - Textinn er miðjaður á móti myndinni (`items-center`), aldrei festur neðst í háum dálki.
 * - Myndin er í breiðu hlutfalli og hæð hennar takmörkuð við skjáhæð, svo titill og mynd
 *   sjáist saman í fyrstu sýn á fartölvu og stærri skjám.
 * - Á síma kemur textinn fyrst (nema `mediaFirstOnMobile`), svo titillinn sjáist strax.
 */
export function SplitHero({
  media,
  children,
  flip = false,
  mediaFirstOnMobile = false,
  className = '',
  label,
}: {
  media: ReactNode
  children: ReactNode
  flip?: boolean
  mediaFirstOnMobile?: boolean
  className?: string
  label?: string
}) {
  return (
    <section aria-label={label} data-hero className={`wrap grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:items-center lg:gap-14 ${className}`}>
      <div data-hero-text className={`min-w-0 lg:col-span-5 ${flip ? 'lg:order-2' : 'lg:order-1'} ${mediaFirstOnMobile ? 'order-2' : 'order-1'}`}>
        {children}
      </div>
      <div data-hero-media className={`min-w-0 lg:col-span-7 ${flip ? 'lg:order-1' : 'lg:order-2'} ${mediaFirstOnMobile ? 'order-1' : 'order-2'}`}>
        {media}
      </div>
    </section>
  )
}

/** Hámarkshæð hero-myndar: alltaf pláss fyrir haus og byrjun efnis í fyrstu sýn. */
export const HERO_MEDIA_CLASS = 'lg:max-h-[min(72svh,720px)]'
