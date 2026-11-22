import { ArrowUpRight, Clapperboard, Instagram, Layers } from 'lucide-react'
import { useAsync } from '../../lib/useAsync'
import { site } from '../../data/site'
import { formatDate } from '../../lib/format'
import { truncate } from '../../lib/html'

interface Post { id: string; permalink: string; caption: string; timestamp: string; type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'; image: string }
interface Feed { status: 'ok' | 'stale' | 'not-connected' | 'error'; posts: Post[] }

/** Straumurinn kemur frá Netlify-falli (/api/instagram); lykillinn er aðeins á þjóninum. */
async function loadFeed(signal: AbortSignal): Promise<Feed> {
  try {
    const res = await fetch('/api/instagram', { signal, headers: { Accept: 'application/json' } })
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) return { status: 'not-connected', posts: [] }
    return (await res.json()) as Feed
  } catch {
    return { status: 'error', posts: [] }
  }
}

/** 6 eða 4 færslur svo grindin verði alltaf heil (engin stök mynd í síðustu röð). */
function visible(posts: Post[]) {
  const n = posts.length >= 6 ? 6 : posts.length >= 4 ? 4 : 0
  return posts.slice(0, n)
}

/**
 * „Fylgstu með á Instagram“: nýjustu færslur @skreytum_hus.
 * Ef straumurinn er ekki tengdur eða ekki til taks birtist aðeins tengill á reikninginn –
 * aldrei gervifærslur eða aðrar myndir í staðinn.
 */
export function InstagramSection() {
  const feed = useAsync('instagram-feed', loadFeed)
  const posts = feed.status === 'success' ? visible(feed.data.posts) : []
  const { handle, url } = site.instagram

  return (
    <section aria-labelledby="instagram" className="wrap sec-y">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Instagram</p>
          <h2 id="instagram" className="display mt-4 text-[clamp(2.4rem,4.6vw,4.2rem)]">Fylgstu með á Instagram</h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
            Daglegt líf, innlit, reels og það nýjasta úr verslunum – <a href={url} target="_blank" rel="noopener noreferrer" className="text-charcoal underline decoration-taupe underline-offset-4 hover:decoration-charcoal">@{handle}</a>.
          </p>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
          <Instagram size={16} aria-hidden /> Fylgja @{handle} <ArrowUpRight size={15} aria-hidden />
        </a>
      </div>

      {feed.status === 'loading' && (
        <div className="tile-grid blk-mt grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" aria-busy="true" aria-label="Hleð Instagram-færslum">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '4 / 5' }} />)}
        </div>
      )}

      {posts.length > 0 && (
        <ul className={`tile-grid blk-mt grid-cols-2 ${posts.length === 6 ? 'sm:grid-cols-3 lg:grid-cols-6' : 'lg:grid-cols-4'}`}>
          {posts.map((p) => {
            const text = p.caption ? truncate(p.caption.replace(/\s+/g, ' '), 120) : 'Instagram-færsla'
            return (
              <li key={p.id}>
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden bg-stone"
                  style={{ aspectRatio: '4 / 5' }}
                  aria-label={`${text} – ${formatDate(p.timestamp)} (opnast á Instagram)`}
                >
                  <img
                    src={p.image}
                    alt={p.caption ? truncate(p.caption.replace(/\s+/g, ' '), 140) : `Instagram-færsla frá @${handle}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                  />
                  {p.type !== 'IMAGE' && (
                    <span className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-night/55 text-ivory" aria-hidden>
                      {p.type === 'VIDEO' ? <Clapperboard size={15} /> : <Layers size={15} />}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
