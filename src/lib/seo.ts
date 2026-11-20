import { useEffect } from 'react'

export const SITE_NAME = 'Skreytum Hús'
const DEFAULT_DESCRIPTION =
  'Skreytum Hús er íslenskt heimilisblogg Soffíu Daggar Garðarsdóttur um skreytingar, breytingar og fegrun heimilisins, síðan 2010.'

interface SeoInput {
  title?: string
  description?: string
  image?: string
  /** Kanónísk slóð. Í demo vísar hún á upprunalegu síðuna á skreytumhus.is svo þessi útgáfa keppi ekki við hana. */
  canonical?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

function setMeta(attr: 'name' | 'property', key: string, value: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!value) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** Setur titil, lýsingu, Open Graph, canonical og JSON-LD fyrir síðuna. */
export function useSeo({ title, description, image, canonical, type = 'website', jsonLd }: SeoInput) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const fullTitle = title ? `${title} – ${SITE_NAME}` : `${SITE_NAME} – Allt um heimilið`
    document.title = fullTitle
    const desc = description || DEFAULT_DESCRIPTION
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'is_IS')
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const href = canonical ?? 'https://www.skreytumhus.is/'
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = href

    document.getElementById('jsonld')?.remove()
    if (ld) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.id = 'jsonld'
      s.text = ld
      document.head.appendChild(s)
    }
  }, [title, description, image, canonical, type, ld])
}
