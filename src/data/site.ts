/** Staðfestar upplýsingar um Skreytum Hús. Ekkert hér er ágiskun — sjá docs/content-inventory.md. */
export const site = {
  name: 'Skreytum Hús',
  tagline: 'Allt um heimilið',
  author: 'Soffía Dögg Garðarsdóttir',
  founded: '2010-09',
  /** Staðfest af eiganda vefsins (nóvember 2026) – notað í öllum mailto-tenglum */
  email: 'soffia@skreytumhus.is',
  liveUrl: 'https://www.skreytumhus.is/',
  tvSeriesUrl: 'https://www.visir.is/sjonvarp/s/319/skreytum-hus',
  /**
   * Instagram: @skreytum_hus. Staðfest út frá skreytumhus.is: reels sem Soffía vísar á sem
   * sín eigin (færslur 95235 og 96003) eru birt af þessum reikningi. Sjá docs/content-inventory.md.
   */
  instagram: { handle: 'skreytum_hus', url: 'https://www.instagram.com/skreytum_hus/' },
  social: [{ label: 'Instagram', href: 'https://www.instagram.com/skreytum_hus/' }] as { label: string; href: string }[],
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
