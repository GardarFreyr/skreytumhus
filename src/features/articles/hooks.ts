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

export const articlePath = (slug: string) => `/greinar/${slug}`
export const projectPath = (slug: string) => `/herbergisbreytingar/${slug}`
