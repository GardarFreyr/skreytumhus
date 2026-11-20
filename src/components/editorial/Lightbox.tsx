import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface LightboxImage {
  src: string
  alt: string
  caption?: string
}

interface Props {
  images: LightboxImage[]
  index: number | null
  onChange: (i: number | null) => void
}

/** Myndaskoðari: lyklaborð (←/→/Esc), strok á snertiskjá, fókus helst inni í glugganum. */
export function Lightbox({ images, index, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const open = index !== null
  const go = useCallback(
    (d: number) => index !== null && onChange((index + d + images.length) % images.length),
    [index, images.length, onChange],
  )

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  const img = index !== null ? images[index] : null

  return (
    <dialog
      ref={dialog}
      aria-label="Myndaskoðari"
      onClose={() => onChange(null)}
      onClick={(e) => e.target === dialog.current && onChange(null)}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-night/95 p-0 text-ivory backdrop:bg-night/80 open:animate-fade"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      {img && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm tabular-nums text-ivory/75" aria-live="polite">
              {index! + 1} / {images.length}
            </p>
            <button type="button" onClick={() => onChange(null)} className="grid size-12 place-items-center rounded-full hover:bg-ivory/10" aria-label="Loka myndaskoðara" autoFocus>
              <X size={22} aria-hidden />
            </button>
          </div>
          <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-6 sm:px-20">
            <img key={img.src} src={img.src} alt={img.alt} className="max-h-full min-h-0 w-auto max-w-full animate-fade object-contain" />
            {img.caption && <figcaption className="mt-4 max-w-2xl text-center text-sm text-ivory/75">{img.caption}</figcaption>}
          </figure>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Fyrri mynd" className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20 sm:grid">
                <ChevronLeft aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Næsta mynd" className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20 sm:grid">
                <ChevronRight aria-hidden />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
