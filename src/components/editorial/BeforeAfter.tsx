import { useId, useRef, useState, type PointerEvent } from 'react'
import { MoveHorizontal } from 'lucide-react'

interface Side { src: string; alt: string }

/**
 * Fyrir/eftir-sleði. Aðeins notaður með staðfestum myndapörum (sama rými, sama sjónarhorn).
 * Virkar með mús, snertingu og lyklaborði (raunverulegt range-svið undir).
 */
export function BeforeAfter({ before, after, ratio = '3 / 4' }: { before: Side; after: Side; ratio?: string }) {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const id = useId()

  const fromPointer = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  return (
    <figure className="m-0">
      <div
        ref={box}
        className="relative select-none overflow-hidden bg-cream touch-pan-y"
        style={{ aspectRatio: ratio }}
        onPointerDown={(e) => {
          dragging.current = true
          box.current?.setPointerCapture?.(e.pointerId)
          fromPointer(e)
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <img src={after.src} alt={after.alt} className="absolute inset-0 h-full w-full scale-[1.07] object-cover" loading="lazy" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={before.src} alt={before.alt} className="absolute inset-0 h-full w-full scale-[1.07] object-cover" loading="lazy" draggable={false} />
        </div>
        <span className="pointer-events-none absolute left-4 top-4 bg-ivory/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal">Fyrir</span>
        <span className="pointer-events-none absolute right-4 top-4 bg-charcoal/85 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ivory">Eftir</span>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-ivory" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ivory text-charcoal shadow-[0_10px_30px_-10px_rgba(0,0,0,.4)]">
            <MoveHorizontal size={20} aria-hidden />
          </span>
        </div>
        <label htmlFor={id} className="sr-only">Færa skil milli fyrir- og eftir-myndar</label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${Math.round(pos)}% fyrir-mynd sýnileg`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-100 [&]:appearance-none"
        />
      </div>
    </figure>
  )
}
