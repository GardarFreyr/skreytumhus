import type { ReactNode } from 'react'

/**
 * Texti ofan á ljósmynd, alltaf læsilegur.
 * Leggst yfir foreldri með `position: relative` (t.d. Link utan um <Img>):
 *  - .photo-shade: mild dekking yfir alla myndina
 *  - .scrim: sterkur dökkur halli beint undir textanum (≥ 74 % þekja þar sem textinn byrjar),
 *    svo birtuskil haldist yfir WCAG AA á björtum, dökkum og flóknum myndum.
 *
 * `reveal`: á stærri skjám birtist textinn aðeins við hover/focus (myndagallerí);
 * á snertiskjám er hann alltaf sýnilegur.
 */
export function PhotoCaption({ children, reveal = false, className = '' }: { children: ReactNode; reveal?: boolean; className?: string }) {
  const hide = reveal
    ? 'md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-focus-visible:opacity-100 md:group-focus-visible:translate-y-0'
    : ''
  return (
    <>
      <span aria-hidden className={`photo-shade transition-opacity duration-500 ${reveal ? 'md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100' : ''}`} />
      <div data-photo-caption className={`scrim absolute inset-x-0 bottom-0 px-4 pb-4 transition-all duration-500 sm:px-6 sm:pb-6 ${hide} ${className}`}>
        {children}
      </div>
    </>
  )
}
