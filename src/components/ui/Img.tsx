import type { Picture } from '../../lib/types'

/**
 * Stöðluð myndhlutföll fyrir allan vefinn. Allar greinarspjaldamyndir nota CARD,
 * svo myndir í sömu röð byrja og enda alltaf á sama stað.
 * Önnur hlutföll eru aðeins notuð í heilbreiðum „hero“-hlutum sem eru hannaðir sérstaklega.
 */
export const RATIO = {
  /** Venjuleg greinarspjöld, smámyndir og listar */
  CARD: '4 / 3',
  /** Myndaflísar (efnisflokkar, innblástur) — einsleitt innan hverrar grindar */
  TILE: '4 / 5',
} as const

interface Props {
  pic?: Picture
  /** CSS aspect-ratio, t.d. RATIO.CARD */
  ratio: string
  sizes: string
  priority?: boolean
  className?: string
  /** Handvirkt object-position ef sjálfvirka valið hentar ekki */
  focus?: string
}

function parseRatio(r: string) {
  const [w, h] = r.split('/').map((n) => Number(n.trim()))
  return w && h ? w / h : 1
}

/**
 * Velur object-position út frá lögun myndar og ramma (WordPress geymir enga brennipunkta):
 * - skammsniðsmynd (portrait) í breiðari ramma: haldið efri-miðju, þar sem andlit,
 *   uppstillingar og borðskreytingar eru nær alltaf — botninn (gólf/borðplata) má fara.
 * - breið mynd í mjórri ramma: miðjan.
 */
function focusFor(pic: Picture | undefined, ratio: string) {
  if (!pic?.width || !pic.height) return '50% 50%'
  const img = pic.width / pic.height
  const frame = parseRatio(ratio)
  if (img < frame * 0.92) return '50% 38%'
  return '50% 50%'
}

/**
 * Mynd í föstum ramma: `aspect-ratio` + `width: 100%` heldur plássinu áður en myndin hleðst
 * (ekkert skrið í útliti) og `object-fit: cover` fyllir rammann án þess að teygja myndina.
 */
export function Img({ pic, ratio, sizes, priority, className = '', focus }: Props) {
  return (
    <div className={`frame w-full ${className}`} style={{ aspectRatio: ratio }}>
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
          style={{ objectPosition: focus ?? focusFor(pic, ratio) }}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-display text-2xl italic text-taupe" aria-hidden="true">
          Skreytum Hús…
        </span>
      )}
    </div>
  )
}
