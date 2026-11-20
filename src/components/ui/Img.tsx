import type { Picture } from '../../lib/types'

interface Props {
  pic?: Picture
  /** CSS aspect-ratio, t.d. "4 / 5" */
  ratio: string
  sizes: string
  priority?: boolean
  className?: string
  /** Klippa ekki af hvíta kantinn (t.d. í lightbox) */
  bare?: boolean
}

/**
 * Mynd í föstum ramma með réttu hlutfalli (engin skrið í útliti), srcset frá
 * WordPress og lazy-loading neðan við fyrsta skjá.
 */
export function Img({ pic, ratio, sizes, priority, className = '' }: Props) {
  return (
    <div className={`frame ${className}`} style={{ aspectRatio: ratio }}>
      {pic ? (
        <img
          src={pic.src}
          srcSet={pic.srcSet}
          sizes={sizes}
          alt={pic.alt}
          width={pic.width}
          height={pic.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-display text-2xl italic text-taupe" aria-hidden="true">
          Skreytum Hús…
        </span>
      )}
    </div>
  )
}
