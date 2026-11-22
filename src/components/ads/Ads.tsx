import { useState } from 'react'
import { dorma, husgagnahollin, slippfelagid, type Ad } from '../../data/ads'

/**
 * Ein auglýsing: merkt „Auglýsing“, í ramma, opnast í nýjum flipa með rel="sponsored".
 * Borðarnir eru 200 px breiðir frá auglýsendum og eru aldrei stækkaðir umfram það (svo þeir verði ekki óskýrir).
 */
export function AdBanner({ ad, className = '' }: { ad: Ad; className?: string }) {
  const [src] = useState(() => ad.images[Math.floor(Math.random() * ad.images.length)])
  return (
    <figure className={`m-0 w-full max-w-[202px] ${className}`}>
      <figcaption className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
        <span>Auglýsing</span>
        <span className="normal-case tracking-normal">{ad.advertiser}</span>
      </figcaption>
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener"
        className="block border border-line bg-white p-0 transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgb(40_39_36/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
      >
        <img src={src} alt={ad.alt} width={ad.width} height={ad.height} loading="lazy" decoding="async" className="block h-auto w-full" />
        <span className="sr-only"> (auglýsing, opnast í nýjum flipa)</span>
      </a>
    </figure>
  )
}

/**
 * Hliðarstika fyrir stærri skjái: tveir 200×300 borðar efst og Slippfélags-turninn
 * sem fylgir lesandanum (sticky) — sama röðun og á lifandi vefnum, í rólegra formi.
 */
export function AdRail({ className = '' }: { className?: string }) {
  return (
    <aside aria-label="Auglýsingar" className={`h-full w-[202px] ${className}`}>
      <div className="flex flex-col gap-10">
        <AdBanner ad={husgagnahollin} />
        <AdBanner ad={dorma} />
      </div>
      <div className="sticky top-32 mt-10">
        <AdBanner ad={slippfelagid} />
      </div>
    </aside>
  )
}

/**
 * Auglýsingahólf milli efnishluta (síma og spjaldtölvur): Slippfélags-turninn vinstra megin
 * og hinir tveir borðarnir hvor ofan á öðrum hægra megin — jafnvægi án þess að slíta lesturinn.
 */
export function AdCluster({ className = '' }: { className?: string }) {
  return (
    <aside aria-label="Auglýsingar" className={`border-y border-line py-10 ${className}`}>
      <p className="eyebrow mb-6 text-center">Auglýsingar</p>
      <div className="mx-auto grid max-w-[440px] grid-cols-2 items-start gap-4 sm:gap-6">
        <AdBanner ad={slippfelagid} className="justify-self-end" />
        <div className="flex flex-col gap-6">
          <AdBanner ad={husgagnahollin} />
          <AdBanner ad={dorma} />
        </div>
      </div>
    </aside>
  )
}
