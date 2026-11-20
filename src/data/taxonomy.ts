/**
 * Efnisflokkar vefsins. Hver flokkur er safn raunverulegra WordPress-flokka
 * (auðkenni staðfest í gegnum REST API 20.11.2026). Engir nýir flokkar eru búnir til
 * í WordPress — þetta er aðeins framsetning ofan á þá sem fyrir eru.
 */
export interface Topic {
  slug: string
  name: string
  description: string
  /** WordPress-flokkar sem falla undir efnisflokkinn */
  categoryIds: number[]
  /** Færsla sem gefur forsíðumynd flokksins */
  coverPostId: number
}

export const topics: Topic[] = [
  {
    slug: 'heimili-og-innblastur',
    name: 'Heimili og innblástur',
    description: 'Mitt heimili, innlit og innblástur úr öllum áttum.',
    categoryIds: [102, 139, 130, 192],
    coverPostId: 89699,
  },
  {
    slug: 'herbergisbreytingar',
    name: 'Herbergisbreytingar',
    description: 'Fyrir og eftir, barnaherbergi, eldhús og stærri breytingar.',
    categoryIds: [109, 111, 116, 115, 121, 142],
    coverPostId: 89803,
  },
  {
    slug: 'skreytingar-og-diy',
    name: 'Skreytingar og DIY',
    description: 'DIY, borðskreytingar, ör-próject og endurvinnsla.',
    categoryIds: [104, 105, 132, 168, 140],
    coverPostId: 96003,
  },
  {
    slug: 'blom-og-arstidir',
    name: 'Blóm og árstíðir',
    description: 'Blóm, kransar, jól, páskar og haustið.',
    categoryIds: [123, 150, 103, 191, 153, 219],
    coverPostId: 82414,
  },
  {
    slug: 'lifsstill',
    name: 'Lífsstíll',
    description: 'Fjölskyldan, ferðalög, veislur og pælingar.',
    categoryIds: [156, 162, 107, 128, 125],
    coverPostId: 89237,
  },
]

export const topicBySlug = (slug: string) => topics.find((t) => t.slug === slug)

/** Flokkar sem birtast sem síur í Innblæstri (raunverulegir WordPress-flokkar). */
export const inspirationFilters = [
  { id: 139, name: 'Innlit' },
  { id: 102, name: 'Mitt heimili' },
  { id: 130, name: 'Innblástur' },
  { id: 136, name: 'Stofur' },
  { id: 149, name: 'Eldhús' },
  { id: 131, name: 'Svefnherbergi' },
  { id: 116, name: 'Barnaherbergi' },
  { id: 132, name: 'Borðskreytingar' },
] as const

export const INSPIRATION_DEFAULT_IDS = [139, 102, 130]

/** Samstarfsfærslur eru merktar svona í WordPress */
export const SPONSORED_CATEGORY_ID = 293
export const BEFORE_AFTER_CATEGORY_ID = 109

/** Ár sem eiga færslur í safninu (fyrsta færsla: september 2010) */
export const ARCHIVE_YEARS = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => 2026 - i)
