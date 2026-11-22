import { useAsync } from '../../lib/useAsync'
import { fetchArticleById, fetchArticleBySlug, fetchArticles } from '../../lib/wp'
import type { ArticleQuery } from '../../lib/types'

export function useArticles(query: ArticleQuery | null) {
  const key = query ? `articles:${JSON.stringify(query)}` : null
  return useAsync(key, (signal) => fetchArticles(query!, signal))
}

/** WordPress geymir íslenska slugga url-kóðaða með lágstöfum (t.d. „j%c3%b3l“). */
export function normalizeSlug(slug: string) {
  try {
    return encodeURIComponent(decodeURIComponent(slug)).toLowerCase()
  } catch {
    return slug.toLowerCase()
  }
}

export function useArticle(slug: string | undefined) {
  const s = slug ? normalizeSlug(slug) : null
  return useAsync(s ? `article:${s}` : null, (signal) => fetchArticleBySlug(s!, signal))
}

export function useArticleById(id: number | null) {
  return useAsync(id ? `article-id:${id}` : null, (signal) => fetchArticleById(id!, signal))
}

/** Tengdar greinar: sömu flokkar, ekki sama færslan. */
export function useRelated(id: number | undefined, categoryIds: number[] | undefined) {
  const cats = (categoryIds ?? []).slice(0, 3)
  return useArticles(id && cats.length ? { categories: cats, exclude: [id], perPage: 3 } : null)
}

const shiftSeconds = (date: string, sec: number) => new Date(new Date(`${date}Z`).getTime() + sec * 1000).toISOString().slice(0, 19)
/** Tímaröð: birtingardagur, og WordPress-ID ef tvær færslur eru birtar á sömu sekúndu */
const compareChrono = (a: { id: number; date: string }, b: { id: number; date: string }) =>
  a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1

/**
 * Fyrri og næsta grein eftir birtingardegi, beint úr WordPress.
 * Glugginn nær yfir sömu sekúndu (`before`/`after` eru ströng), svo færslur með
 * nákvæmlega sama birtingartíma sleppast ekki. Engin færsla → engin tenging.
 */
export function useAdjacent(a: { id: number; date: string }) {
  const older = useArticles({ before: shiftSeconds(a.date, 1), order: 'desc', perPage: 4, exclude: [a.id] })
  const newer = useArticles({ after: shiftSeconds(a.date, -1), order: 'asc', perPage: 4, exclude: [a.id] })
  const previous = older.data?.items.filter((x) => compareChrono(x, a) < 0).sort(compareChrono).at(-1)
  const next = newer.data?.items.filter((x) => compareChrono(x, a) > 0).sort(compareChrono)[0]
  return { previous, next, loading: older.status === 'loading' || newer.status === 'loading' }
}

export const articlePath = (slug: string) => `/greinar/${slug}`
export const projectPath = (slug: string) => `/herbergisbreytingar/${slug}`
