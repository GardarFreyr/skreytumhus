/** Efnislíkan vefsins, óháð WordPress. Íhlutir nota aðeins þessar tegundir. */

export interface ImageSource {
  url: string
  width: number
  height: number
}

export interface Picture {
  src: string
  /** srcset-strengur úr stærðum WordPress */
  srcSet?: string
  width: number
  height: number
  alt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  count?: number
}

export interface ArticleSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string // ISO
  modified: string
  link: string // upprunaleg slóð á skreytumhus.is
  image?: Picture
  categories: Category[]
  tags: Category[]
  author: string
  /** Færsla merkt sem samstarf / auglýsing í WordPress */
  sponsored: boolean
}

export interface Article extends ArticleSummary {
  /** Hreinsað HTML úr WordPress */
  html: string
}

export interface Paged<T> {
  items: T[]
  total: number
  totalPages: number
  page: number
}

export interface ArticleQuery {
  page?: number
  perPage?: number
  categories?: number[]
  tags?: number[]
  /** 'OR': færslur í einhverjum flokkanna EÐA með einhverju merkjanna */
  taxRelation?: 'OR'
  search?: string
  include?: number[]
  exclude?: number[]
  year?: number
  order?: 'desc' | 'asc'
}
