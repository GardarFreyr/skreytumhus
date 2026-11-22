/**
 * Les-aðgangur (read-only) að WordPress REST API á skreytumhus.is.
 *
 * Vefþjónninn hafnar /wp-json/ slóðum utan frá, en `?rest_route=` virkar og
 * CORS er opið fyrir GET. Hér er aðeins lesið — ekkert er skrifað á lifandi vefinn.
 * Allt sem íhlutir fá er umbreytt í tegundirnar í ./types.ts.
 */
import type { Article, ArticleQuery, ArticleSummary, Category, Paged, Picture } from './types'
import { cleanExcerpt, decode, sanitizeArticleHtml } from './html'

export const WP_ORIGIN = 'https://www.skreytumhus.is'
const API = `${WP_ORIGIN}/`

/** Flokkar/merki sem gefa til kynna að færsla sé unnin í samstarfi. */
const SPONSORED_CATEGORY_IDS = new Set([293, 448]) // Samstarf, AD
const SPONSORED_TAG_IDS = new Set([305, 449]) // samstarf, AD

const LIST_FIELDS = 'id,slug,title,excerpt,date,modified,link,categories,tags,_links,_embedded'

/* ── Hrá tegundir úr WordPress (aðeins það sem við notum) ── */
interface WPSize { source_url: string; width: number; height: number }
interface WPMedia {
  source_url: string
  alt_text?: string
  media_details?: { width?: number; height?: number; sizes?: Record<string, WPSize> }
}
interface WPTerm { id: number; name: string; slug: string; taxonomy: string; count?: number }
interface WPPost {
  id: number
  slug: string
  date: string
  modified: string
  link: string
  title: { rendered: string }
  excerpt?: { rendered: string }
  content?: { rendered: string }
  categories?: number[]
  tags?: number[]
  _embedded?: {
    author?: { name: string }[]
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPTerm[][]
  }
}

export class NotFoundError extends Error {}

function buildUrl(route: string, params: Record<string, string | number | undefined>) {
  const url = new URL(API)
  url.searchParams.set('rest_route', route)
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  return url.toString()
}

async function request<T>(route: string, params: Record<string, string | number | undefined> = {}, signal?: AbortSignal) {
  const res = await fetch(buildUrl(route, params), { signal, headers: { Accept: 'application/json' } })
  if (res.status === 404) throw new NotFoundError(route)
  if (res.status === 400) {
    // WordPress skilar 400 þegar beðið er um síðu umfram fjölda síðna
    const body = await res.json().catch(() => ({}))
    if (body?.code === 'rest_post_invalid_page_number') return { data: [] as unknown as T, total: 0, totalPages: 0 }
    throw new Error(body?.message ?? `Villa ${res.status}`)
  }
  if (!res.ok) throw new Error(`Gat ekki sótt efni (${res.status})`)
  const data = (await res.json()) as T
  return {
    data,
    total: Number(res.headers.get('X-WP-Total') ?? 0),
    totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 0),
  }
}

/* ── Umbreytingar ── */

export function toPicture(media: WPMedia | undefined, alt: string): Picture | undefined {
  if (!media?.source_url) return undefined
  const sizes = Object.values(media.media_details?.sizes ?? {})
    .filter((s) => s.width >= 300 && s.width <= 2048)
    .sort((a, b) => a.width - b.width)
  const unique = sizes.filter((s, i) => i === 0 || s.width !== sizes[i - 1].width)
  const largest = unique.at(-1)
  return {
    src: largest?.source_url ?? media.source_url,
    srcSet: unique.map((s) => `${encodeURI(decodeURI(s.source_url))} ${s.width}w`).join(', ') || undefined,
    width: media.media_details?.width ?? largest?.width ?? 1200,
    height: media.media_details?.height ?? largest?.height ?? 1500,
    alt: decode(media.alt_text || '') || alt,
  }
}

function toSummary(p: WPPost): ArticleSummary {
  const terms = (p._embedded?.['wp:term'] ?? []).flat()
  const cats: Category[] = terms.filter((t) => t.taxonomy === 'category' && t.id !== 1).map((t) => ({ id: t.id, name: decode(t.name), slug: t.slug }))
  const tags: Category[] = terms.filter((t) => t.taxonomy === 'post_tag').map((t) => ({ id: t.id, name: decode(t.name), slug: t.slug }))
  const title = decode(p.title.rendered)
  return {
    id: p.id,
    slug: p.slug,
    title,
    excerpt: cleanExcerpt(p.excerpt?.rendered ?? ''),
    date: p.date,
    modified: p.modified,
    link: p.link,
    image: toPicture(p._embedded?.['wp:featuredmedia']?.[0], title),
    categories: cats,
    tags,
    author: (p._embedded?.author?.[0]?.name ?? 'Soffía Dögg').replace(/\s*-\s*Skreytum H[úu]s.*$/i, '').replace(/^Soffia\b/, 'Soffía Dögg'),
    sponsored: (p.categories ?? []).some((c) => SPONSORED_CATEGORY_IDS.has(c)) || (p.tags ?? []).some((t) => SPONSORED_TAG_IDS.has(t)),
  }
}

/* ── Fyrirspurnir ── */

export async function fetchArticles(q: ArticleQuery = {}, signal?: AbortSignal): Promise<Paged<ArticleSummary>> {
  const page = q.page ?? 1
  const params: Record<string, string | number | undefined> = {
    page,
    per_page: q.perPage ?? 12,
    _embed: 'wp:featuredmedia,wp:term,author',
    _fields: LIST_FIELDS,
    orderby: q.search ? 'relevance' : 'date',
    order: q.order ?? 'desc',
    categories: q.categories?.join(','),
    tags: q.tags?.join(','),
    tax_relation: q.categories?.length && q.tags?.length ? q.taxRelation : undefined,
    search: q.search,
    include: q.include?.join(','),
    exclude: q.exclude?.join(','),
  }
  if (q.include?.length) {
    params.orderby = 'include'
    params.per_page = q.include.length
  }
  if (q.year) {
    params.after = `${q.year - 1}-12-31T23:59:59`
    params.before = `${q.year + 1}-01-01T00:00:00`
  }
  if (q.before) params.before = q.before
  if (q.after) params.after = q.after
  const { data, total, totalPages } = await request<WPPost[]>('/wp/v2/posts', params, signal)
  return { items: data.map(toSummary), total, totalPages, page }
}

export async function fetchArticleBySlug(slug: string, signal?: AbortSignal): Promise<Article> {
  const { data } = await request<WPPost[]>('/wp/v2/posts', { slug, _embed: 'wp:featuredmedia,wp:term,author' }, signal)
  if (!data.length) throw new NotFoundError(slug)
  return toArticle(data[0])
}

export async function fetchArticleById(id: number, signal?: AbortSignal): Promise<Article> {
  const { data } = await request<WPPost>(`/wp/v2/posts/${id}`, { _embed: 'wp:featuredmedia,wp:term,author' }, signal)
  return toArticle(data)
}

function toArticle(p: WPPost): Article {
  return { ...toSummary(p), html: sanitizeArticleHtml(p.content?.rendered ?? '') }
}

export async function fetchPage(id: number, signal?: AbortSignal) {
  const { data } = await request<WPPost>(`/wp/v2/pages/${id}`, { _embed: 'wp:featuredmedia' }, signal)
  return { title: decode(data.title.rendered), html: sanitizeArticleHtml(data.content?.rendered ?? ''), modified: data.modified, link: data.link }
}

export async function fetchCategoryBySlug(slug: string, signal?: AbortSignal): Promise<Category> {
  const { data } = await request<WPTerm[]>('/wp/v2/categories', { slug, _fields: 'id,name,slug,count' }, signal)
  if (!data.length) throw new NotFoundError(slug)
  return { id: data[0].id, name: decode(data[0].name), slug: data[0].slug, count: data[0].count }
}

export async function fetchCategoryById(id: number, signal?: AbortSignal): Promise<Category> {
  const { data } = await request<WPTerm>(`/wp/v2/categories/${id}`, { _fields: 'id,name,slug,count' }, signal)
  return { id: data.id, name: decode(data.name), slug: data.slug, count: data.count }
}

/** Fjöldi færslna í heild — notað til að sýna stærð safnsins með raunverulegri tölu. */
export async function fetchArchiveTotal(signal?: AbortSignal) {
  const { total } = await request<WPPost[]>('/wp/v2/posts', { per_page: 1, _fields: 'id' }, signal)
  return total
}
