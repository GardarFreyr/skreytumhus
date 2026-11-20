import { Link, useLocation } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Síðuskipting byggð á ?sida= svo hver síða hafi sína slóð (deilanleg, virkar með Til baka). */
export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { pathname, search } = useLocation()
  if (totalPages <= 1) return null

  const href = (p: number) => {
    const params = new URLSearchParams(search)
    if (p === 1) params.delete('sida')
    else params.set('sida', String(p))
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ''}`
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
  const list = [...pages].sort((a, b) => a - b)

  return (
    <nav aria-label="Síður" className="mt-20 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link to={href(page - 1)} className="btn btn-line !px-5" aria-label="Fyrri síða">
          <ChevronLeft size={16} aria-hidden /> Fyrri
        </Link>
      ) : null}
      <ol className="flex items-center gap-1">
        {list.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && p - list[i - 1] > 1 && <span className="px-1 text-muted" aria-hidden>…</span>}
            <Link
              to={href(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm transition-colors ${p === page ? 'bg-charcoal text-ivory' : 'hover:bg-cream'}`}
            >
              <span className="sr-only">Síða </span>
              {p}
            </Link>
          </li>
        ))}
      </ol>
      {page < totalPages ? (
        <Link to={href(page + 1)} className="btn btn-line !px-5" aria-label="Næsta síða">
          Næsta <ChevronRight size={16} aria-hidden />
        </Link>
      ) : null}
    </nav>
  )
}
