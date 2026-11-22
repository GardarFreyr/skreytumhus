/**
 * Efnisorðaskrá: allir raunverulegir flokkar og merki (tags) úr WordPress.
 *
 * Flokkur og merki með sama nafni (t.d. „Jól“ sem flokkur og sem merki) eru sameinuð
 * í eitt efnisorð; greinalistinn sækir þá færslur sem bera annað hvort (tax_relation=OR),
 * svo tengsl greina og efnisorða haldast nákvæmlega eins og í WordPress.
 * Ekkert er búið til: efnisorð sem ekki eru til í WordPress birtast aldrei.
 */
import { decode } from './html'
import { WP_ORIGIN } from './wp'

interface WPTermRow { id: number; name: string; slug: string; count: number }

export interface Term {
  /** Stöðugur lykill í slóð: /efni/<key> */
  key: string
  name: string
  categoryIds: number[]
  tagIds: number[]
  /** Fjöldi greina í stærsta undirliggjandi flokki/merki (raunveruleg tala úr WordPress) */
  count: number
  /** true ef fleiri en eitt flokk/merki liggja að baki – þá er heildin a.m.k. `count` */
  merged: boolean
}

/** Íslenskir stafir → latneskir, svo „eldhus“ finni „Eldhús“ og slóðir verði hreinar. */
const FOLD: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ý: 'y', ð: 'd', þ: 'th', æ: 'ae', ö: 'o' }
export const fold = (s: string) =>
  s.toLocaleLowerCase('is').normalize('NFC').replace(/[áéíóúýðþæö]/g, (c) => FOLD[c]).normalize('NFD').replace(/[̀-ͯ]/g, '')

export const termKey = (name: string) => fold(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Flokkar sem eru tæknilegir og ekki efnisorð */
const HIDDEN_CATEGORY_IDS = new Set([1]) // Uncategorized

async function fetchAll(kind: 'categories' | 'tags', signal?: AbortSignal) {
  const url = (page: number) =>
    `${WP_ORIGIN}/?rest_route=/wp/v2/${kind}&per_page=100&page=${page}&hide_empty=true&orderby=count&order=desc&_fields=id,name,slug,count`
  const first = await fetch(url(1), { signal })
  if (!first.ok) throw new Error(`Gat ekki sótt efnisorð (${first.status})`)
  const pages = Number(first.headers.get('X-WP-TotalPages') ?? 1)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetch(url(i + 2), { signal }).then((r) => r.json() as Promise<WPTermRow[]>)),
  )
  return [(await first.json()) as WPTermRow[], ...rest].flat()
}

export interface TermIndex {
  terms: Term[]
  byKey: Map<string, Term>
  categoryCount: number
  tagCount: number
}

let pending: Promise<TermIndex> | null = null

/** Sækir alla flokka og merki einu sinni á hverja setu. */
export function loadTermIndex(): Promise<TermIndex> {
  pending ??= (async () => {
    const [cats, tags] = await Promise.all([fetchAll('categories'), fetchAll('tags')])
    const map = new Map<string, Term>()
    const add = (row: WPTermRow, kind: 'cat' | 'tag') => {
      const name = decode(row.name).trim()
      const key = termKey(name)
      if (!key || row.count < 1) return
      const t = map.get(key) ?? { key, name, categoryIds: [], tagIds: [], count: 0, merged: false }
      ;(kind === 'cat' ? t.categoryIds : t.tagIds).push(row.id)
      // Sýnum nafnið eins og það er ritað í stærsta flokknum/merkinu (t.d. „Barnaherbergi“ frekar en „barnaherbergi“)
      if (row.count > t.count) {
        t.count = row.count
        if (/^\p{Lu}/u.test(name) || !/^\p{Lu}/u.test(t.name)) t.name = name
      } else if (!/^\p{Lu}/u.test(t.name) && /^\p{Lu}/u.test(name)) t.name = name
      t.merged = t.categoryIds.length + t.tagIds.length > 1
      map.set(key, t)
    }
    cats.filter((c) => !HIDDEN_CATEGORY_IDS.has(c.id)).forEach((c) => add(c, 'cat'))
    tags.forEach((t) => add(t, 'tag'))
    const terms = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'is'))
    return { terms, byKey: map, categoryCount: cats.filter((c) => !HIDDEN_CATEGORY_IDS.has(c.id)).length, tagCount: tags.length }
  })().catch((e) => {
    pending = null
    throw e
  })
  return pending
}

/** Leit í efnisorðum: hlutaleit, óháð há/lágstöfum og kommum („jol“ finnur „Jól“, „herb“ finnur „Barnaherbergi“). */
export function searchTerms(terms: Term[], query: string, limit = 40): Term[] {
  const q = fold(query.trim())
  if (!q) return []
  const raw = query.trim().toLocaleLowerCase('is')
  // Ef leitað er með íslenskum stöfum („jól“) er borið saman við stafina eins og þeir eru,
  // svo „jól“ finni ekki „fjölskyldan“. Án þeirra („jol“) er borið saman án kommna.
  const accented = /[áéíóúýðþæö]/.test(raw)
  const norm = (s: string) => (accented ? s.toLocaleLowerCase('is') : fold(s))
  const nq = accented ? raw : q
  return terms
    .map((t) => {
      const f = norm(t.name)
      const exact = t.name.toLocaleLowerCase('is')
      const score = exact === raw || f === nq ? 0 : f.startsWith(nq) ? 1 : f.split(/[^\p{L}\p{N}]+/u).some((w) => w.startsWith(nq)) ? 2 : f.includes(nq) ? 3 : -1
      return { t, score }
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || b.t.count - a.t.count)
    .slice(0, limit)
    .map((x) => x.t)
}

export const termPath = (t: Pick<Term, 'key'>) => `/efni/${t.key}`
export const formatTermCount = (t: Term) => `${t.count}${t.merged ? '+' : ''}`
