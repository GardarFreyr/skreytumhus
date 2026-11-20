/** Staðfestar upplýsingar um Skreytum Hús. Ekkert hér er ágiskun — sjá docs/content-inventory.md. */
export const site = {
  name: 'Skreytum Hús',
  tagline: 'Allt um heimilið',
  author: 'Soffía Dögg Garðarsdóttir',
  founded: '2010-09',
  /** Birt opinberlega á síðunni „Herbergisbreytingar“ á skreytumhus.is */
  email: 'soffiadogg@yahoo.com',
  liveUrl: 'https://www.skreytumhus.is/',
  tvSeriesUrl: 'https://www.visir.is/sjonvarp/s/319/skreytum-hus',
  /**
   * Samfélagsmiðlar: engir tenglar á samfélagsmiðla fundust á skreytumhus.is.
   * Bætið við hér þegar Soffía hefur staðfest slóðirnar — þá birtast þeir sjálfkrafa.
   */
  social: [] as { label: string; href: string }[],
} as const

export const mainNav = [
  { to: '/', label: 'Forsíða', end: true },
  { to: '/greinar', label: 'Greinar' },
  { to: '/innblastur', label: 'Innblástur' },
  { to: '/herbergisbreytingar', label: 'Herbergisbreytingar' },
  { to: '/tv', label: 'Skreytum Hús TV' },
  { to: '/um-mig', label: 'Um mig' },
] as const

/** WordPress-síður sem eru notaðar beint */
export const WP_PAGES = {
  about: 10,
  projects: 3648,
} as const
