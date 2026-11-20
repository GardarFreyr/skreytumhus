/**
 * Skreytum Hús á Vísi / Stöð 2+.
 * Hver þáttur vísar í bloggfærslu Soffíu um þáttinn (postId) og í áhorfstengilinn
 * sem hún birti sjálf í þeirri færslu. Ekkert hér er búið til — sjá docs/content-inventory.md.
 * Titlar og myndir eru sóttir úr færslunum sjálfum.
 */
export interface Episode {
  postId: number
  season: number
  episode: number
  /** Tengill sem birtist í færslunni; vantar ef enginn fannst */
  watchUrl?: string
}

export interface Season {
  number: number
  year: string
  note?: string
  episodes: Episode[]
}

const SERIES = 'https://www.visir.is/sjonvarp/s/319/skreytum-hus'

export const seasons: Season[] = [
  {
    number: 5,
    year: 'Haust 2024',
    note: 'Sex þættir sem komu inn vikulega, fyrst á Vísi.is og síðan á Stöð 2+.',
    episodes: [
      { postId: 89947, season: 5, episode: 6, watchUrl: SERIES },
      { postId: 89909, season: 5, episode: 5, watchUrl: SERIES },
      { postId: 89803, season: 5, episode: 4, watchUrl: SERIES },
      { postId: 89699, season: 5, episode: 3, watchUrl: SERIES },
      { postId: 89589, season: 5, episode: 2, watchUrl: SERIES },
      { postId: 89226, season: 5, episode: 1, watchUrl: SERIES },
    ],
  },
  {
    number: 4,
    year: 'Haust 2023',
    episodes: [
      { postId: 84942, season: 4, episode: 6, watchUrl: 'https://www.visir.is/k/0a039dae-05cf-47f0-b212-19940933adf9-1701337562006' },
      { postId: 84674, season: 4, episode: 5, watchUrl: 'https://www.visir.is/k/160070d1-15b9-4987-a6a0-153dee181332-1700831750021/skreytum-hus-hjonaherbergi-gudrunar-veigu-' },
      { postId: 83884, season: 4, episode: 4, watchUrl: 'https://www.visir.is/k/2894275d-bf91-4962-bdcc-6d259d27d523-1700069006967' },
      { postId: 84397, season: 4, episode: 3, watchUrl: 'https://www.visir.is/k/cffe398b-636f-43d8-8ee8-92fc3479c13c-1699572894646' },
      { postId: 83794, season: 4, episode: 2, watchUrl: 'https://www.visir.is/k/9a32e7d0-a788-449e-80f2-273021a5048e-1699026255681' },
      { postId: 83883, season: 4, episode: 1, watchUrl: 'https://www.visir.is/k/9416c3ec-342e-4d86-a944-a74016a70a47-1698414731395' },
    ],
  },
  {
    number: 3,
    year: 'Haust 2021',
    episodes: [
      { postId: 72736, season: 3, episode: 6, watchUrl: 'https://www.visir.is/k/793a2509-4e4e-49fd-a6b5-868ae6d5913b-1638283004826/skreytum-hus-godgerdarverkefni-fyrir-mia-magic' },
      { postId: 72617, season: 3, episode: 5, watchUrl: 'https://www.visir.is/g/20212186946d/skreytum-hus-let-draum-unglingsstulku-raetast-i-vesturbae' },
      { postId: 72386, season: 3, episode: 4 },
      { postId: 72226, season: 3, episode: 3, watchUrl: 'https://www.visir.is/g/20212181000d/skreytum-hus-ris-i-kopavogi-gert-ad-kosy-fjolskyldurymi' },
      { postId: 71998, season: 3, episode: 2, watchUrl: 'https://www.visir.is/k/cf34738b-463e-46ce-95dd-e5479c77add8-1635865016535' },
      { postId: 71634, season: 3, episode: 1, watchUrl: 'https://www.visir.is/k/f743b973-72e4-42df-b4de-a551f6c9b8ac-1635249739037' },
    ],
  },
  {
    number: 2,
    year: 'Vor 2021',
    episodes: [
      { postId: 68812, season: 2, episode: 6, watchUrl: 'https://www.visir.is/g/20212108220d/skreytum-hus-ordlausar-yfir-breytingunni-a-afangaheimilinu' },
      { postId: 68679, season: 2, episode: 5, watchUrl: 'https://www.visir.is/g/20212105317d/skreytum-hus-mer-finnst-stofan-hafa-staekkad-' },
      { postId: 68507, season: 2, episode: 4, watchUrl: 'https://www.visir.is/g/20212102045d/skreytum-hus-eg-helt-ad-eg-myndi-aldrei-fa-svona-herbergi-' },
      { postId: 68396, season: 2, episode: 3, watchUrl: 'https://www.visir.is/g/20212099518d/skreytum-hus-tok-andkof-thegar-hun-sa-dasamlega-barnaherbergid' },
      { postId: 68308, season: 2, episode: 2, watchUrl: 'https://www.visir.is/g/20212096647d/skreytum-hus-thad-er-svolitid-eins-og-thad-se-vatnshalli-a-ryminu.-' },
      { postId: 68169, season: 2, episode: 1, watchUrl: 'https://www.visir.is/g/20212094078d/skreytum-hus-svefnherbergid-nanast-othekkjanlegt-eftir-breytingarnar' },
    ],
  },
  {
    number: 1,
    year: 'Haust 2020',
    episodes: [
      { postId: 67014, season: 1, episode: 6, watchUrl: 'https://www.visir.is/g/20202049474d/skreytum-hus-alin-upp-vid-ad-jola-yfir-mig-a-hverju-einasta-ari-' },
      { postId: 66773, season: 1, episode: 5, watchUrl: 'https://www.visir.is/g/20202046816/' },
      { postId: 66626, season: 1, episode: 4, watchUrl: 'https://www.visir.is/g/20202043622d/skreytum-hus-barnaherbergjum-breytt-i-aevintyraheim' },
      { postId: 66492, season: 1, episode: 3, watchUrl: 'https://www.visir.is/g/20202040768d/skreytum-hus-hjonaherbergid-gert-romo-og-kosy-' },
      { postId: 66285, season: 1, episode: 2, watchUrl: 'https://www.visir.is/g/20202037866d/skreytum-hus-mer-lidur-eins-og-thetta-se-ekki-herbergid-mitt-' },
      { postId: 66166, season: 1, episode: 1, watchUrl: 'https://www.visir.is/g/20202035303d/skreytum-hus-va-thetta-er-bara-allt-annad-' },
    ],
  },
]

/** Stuttir DIY-þættir sem Soffía birti með tenglum á Vísi */
export const diyClips: Episode[] = [
  { postId: 75098, season: 0, episode: 0, watchUrl: 'https://www.visir.is/k/47db0c33-fc86-422b-80cd-b1cf07381366-1619598892631' },
  { postId: 75090, season: 0, episode: 0, watchUrl: 'https://www.visir.is/k/89a4b70f-a304-4728-9759-ccfdc621ccd3-1620166204767' },
  { postId: 75092, season: 0, episode: 0, watchUrl: 'https://www.visir.is/k/9daad3c2-51e3-456b-ba9f-f4b780806026-1620777101106' },
  { postId: 75096, season: 0, episode: 0, watchUrl: 'https://www.visir.is/k/f0faf954-3c20-4739-8189-10fd84e844a0-1617722393967' },
]

export const TV_SERIES_URL = SERIES
export const TV_CATEGORY_ID = 398
