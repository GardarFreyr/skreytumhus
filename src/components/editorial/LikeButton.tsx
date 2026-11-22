import { Heart } from 'lucide-react'
import { useLikes } from '../../features/likes/useLikes'

const nf = new Intl.NumberFormat('is-IS')

/**
 * Hjarta: „Líkar við“ grein. Talan er sameiginleg öllum gestum (sjá useLikes).
 * Ef þjónustan svarar ekki birtist ekkert – aldrei tilbúin tala.
 * `size="lg"` í lok greinar, `sm` í haus hennar.
 */
export function LikeButton({ postId, size = 'lg' }: { postId: number; size?: 'sm' | 'lg' }) {
  const { status, count, liked, pending, error, toggle } = useLikes(postId)
  if (status === 'unavailable') return null

  const ready = status === 'ready'
  const label = !ready ? 'Hleð fjölda sem líkar við greinina' : liked ? `Þér líkar við greinina – smelltu til að hætta við. Fjöldi: ${count}` : `Líka við greinina. Fjöldi: ${count}`
  const lg = size === 'lg'

  return (
    <span className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${lg ? '' : 'contents'}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-pressed={ready ? liked : undefined}
        aria-label={label}
        aria-busy={pending || undefined}
        className={`group inline-flex items-center rounded-full border transition-[border-color,background-color,color] duration-300 disabled:cursor-default ${
          lg ? 'min-h-12 gap-2.5 px-5 text-[14px]' : 'min-h-11 gap-2 px-3.5 text-[13.5px]'
        } ${liked ? 'border-charcoal bg-charcoal text-ivory' : 'border-stone text-charcoal hover:border-charcoal'}`}
      >
        <Heart
          size={lg ? 18 : 16}
          aria-hidden
          strokeWidth={1.6}
          className={`transition-transform duration-300 ease-[var(--ease-editorial)] ${liked ? 'fill-current' : 'group-hover:scale-110'} ${pending && liked ? 'motion-safe:animate-[heart-pop_0.45s_var(--ease-editorial)]' : ''}`}
        />
        {/* Föst breidd fyrir töluna svo hnappurinn hoppi ekki þegar hún birtist */}
        <span className="min-w-[1.5ch] tabular-nums" aria-hidden>{ready ? nf.format(count) : ' '}</span>
        {lg && <span aria-hidden className={liked ? 'text-ivory/80' : 'text-muted'}>{liked ? 'Þér líkar þetta' : 'Líkar þér greinin?'}</span>}
      </button>
      {error && <span role="status" className="text-[13px] text-muted">{error}</span>}
    </span>
  )
}
