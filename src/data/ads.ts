/**
 * Auglýsingar sem birtast á skreytumhus.is (AdRotate-hliðarstikan), sóttar 22.11.2026.
 * Myndirnar eru upprunalegu borðarnir, óbreyttir, afritaðir í public/ads/.
 * Slóðirnar eru nákvæmlega þær sem borðarnir vísa á á lifandi vefnum.
 *
 * Slippfélagið skiptist á þremur útgáfum (A, B, C) á lifandi vefnum — það sama er gert hér.
 */
export type Ad = {
  id: string
  advertiser: string
  href: string
  /** Ein eða fleiri útgáfur; ein er valin af handahófi við hverja birtingu */
  images: string[]
  width: number
  height: number
  alt: string
}

export const slippfelagid: Ad = {
  id: 'slippfelagid',
  advertiser: 'Slippfélagið',
  href: 'https://slippfelagid.is/litir-og-litakort/skreytum-hus/',
  images: [
    '/ads/Slippfelagid-Skreytum-hus-banner-skreytumhus-2025_A-200x720px.jpg',
    '/ads/Slippfelagid-Skreytum-hus-banner-skreytumhus-2025_B-200x720px.jpg',
    '/ads/Slippfelagid-Skreytum-hus-banner-skreytumhus-2025_C-200x720px.jpg',
  ],
  width: 200,
  height: 719,
  alt: 'Slippfélagið: Skreytum hús litakort. Þú færð Skreytum hús litakort í verslunum Slippfélagsins.',
}

export const husgagnahollin: Ad = {
  id: 'husgagnahollin',
  advertiser: 'Húsgagnahöllin',
  href: 'https://husgagnahollin.is/',
  images: ['/ads/200x300-HH-jolabretti-SH.jpg'],
  width: 200,
  height: 300,
  alt: 'Húsgagnahöllin: Þú finnur jólagjöfina í Höllinni. Smelltu hér og skoðaðu.',
}

export const dorma: Ad = {
  id: 'dorma',
  advertiser: 'Dorma',
  href: 'https://dorma.is/',
  images: ['/ads/200x300-Dorma-bamboo-SH.jpg'],
  width: 200,
  height: 300,
  alt: 'Dorma: Kosy bamboo rúmföt.',
}
