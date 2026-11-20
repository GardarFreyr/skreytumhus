import { Link } from 'react-router'
import type { ReactNode } from 'react'

export function ErrorState({ error, retry }: { error?: Error; retry?: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-xl py-24 text-center">
      <p className="display text-4xl">Æ, eitthvað fór úrskeiðis…</p>
      <p className="mt-4 text-muted">
        Ekki tókst að sækja efnið frá skreytumhus.is. {error?.message ? `(${error.message})` : ''}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-dark" onClick={retry ?? (() => window.location.reload())}>
          Reyna aftur
        </button>
        <Link to="/" className="btn btn-line">Á forsíðu</Link>
      </div>
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="display text-4xl">{title}</p>
      {children && <div className="mt-4 text-muted">{children}</div>}
    </div>
  )
}

/** Beinagrind sem heldur sama hlutfalli og spjöldin svo útlitið hoppi ekki. */
export function CardSkeletons({ count = 6, ratio = '4 / 5', className = '' }: { count?: number; ratio?: string; className?: string }) {
  return (
    <div className={className} aria-busy="true" aria-label="Hleð greinum">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: ratio }} />
          <div className="skeleton mt-4 h-3 w-24" />
          <div className="skeleton mt-3 h-6 w-4/5" />
        </div>
      ))}
    </div>
  )
}

export function SectionHeader({ eyebrow, title, children, as: H = 'h2', id }: { eyebrow?: string; title: ReactNode; children?: ReactNode; as?: 'h1' | 'h2'; id?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <H id={id} className="display text-[clamp(2.4rem,5vw,4.6rem)]">{title}</H>
      </div>
      {children}
    </div>
  )
}
