import { Link } from 'react-router'
import { ArrowUpRight, Mail } from 'lucide-react'
import { useAsync } from '../lib/useAsync'
import { fetchPage } from '../lib/wp'
import { useSeo } from '../lib/seo'
import { ArticleBody } from '../components/editorial/ArticleBody'
import { ErrorState } from '../components/ui/States'
import { site, WP_PAGES } from '../data/site'

const PORTRAIT = 'https://www.skreytumhus.is/wp-content/uploads/2020/12/www.skreytumhus.is2020-09-25-18.20.152-500x889.jpg'

/** Ævisagan er upprunalegi textinn af síðunni „Um mig“ á skreytumhus.is, óbreyttur. */
export default function AboutPage() {
  const page = useAsync(`page:${WP_PAGES.about}`, (s) => fetchPage(WP_PAGES.about, s))
  useSeo({
    title: 'Um mig',
    description: 'Soffía Dögg Garðarsdóttir — Dossa — garðyrkjufræðingur af blómaskreytingabraut og höfundur Skreytum Hús síðan 2010.',
    canonical: 'https://www.skreytumhus.is/?page_id=10',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Person', name: 'Soffía Dögg Garðarsdóttir', alternateName: 'Dossa', url: site.liveUrl },
  })

  return (
    <div className="sec-b">
      <header className="wrap grid gap-12 pt-10 lg:grid-cols-12 lg:items-center lg:gap-20 lg:pt-16">
        <div className="lg:col-span-5">
          <div className="frame" style={{ aspectRatio: '4 / 5' }}>
            <img src={PORTRAIT} alt="Soffía Dögg Garðarsdóttir" fetchPriority="high" style={{ objectPosition: '50% 30%' }} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="eyebrow">Um mig</p>
          <h1 className="display mt-6 text-[clamp(3rem,7vw,6.6rem)]">
            Soffía Dögg <em className="text-taupe-ink">— Dossa</em>
          </h1>
          <p className="mt-8 max-w-xl font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-snug text-charcoal">
            „Vertu velkomin á Skreytum Hús og gaman að sjá þig hér.“
          </p>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
            <div><dt className="text-[12px] uppercase tracking-[0.18em] text-muted">Bloggið hófst</dt><dd className="mt-2 font-display text-3xl">Sept. 2010</dd></div>
            <div><dt className="text-[12px] uppercase tracking-[0.18em] text-muted">Bakgrunnur</dt><dd className="mt-2 font-display text-3xl">Blóma&shy;skreytingar</dd></div>
            <div><dt className="text-[12px] uppercase tracking-[0.18em] text-muted">Sjónvarp</dt><dd className="mt-2 font-display text-3xl">5 þáttaraðir</dd></div>
          </dl>
        </div>
      </header>

      <section aria-label="Sagan mín" className="wrap sec-mt">
        <p className="eyebrow mx-auto mb-10 max-w-[680px]">Sagan mín — með orðum Soffíu</p>
        {page.status === 'error' && <ErrorState error={page.error} />}
        {page.status === 'loading' && (
          <div className="mx-auto max-w-[680px] space-y-4" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-4" style={{ width: `${92 - (i % 3) * 12}%` }} />)}
          </div>
        )}
        {page.data && <ArticleBody html={page.data.html} />}
      </section>

      <section aria-labelledby="meira" className="wrap sec-mt">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          <h2 id="meira" className="sr-only">Meira</h2>
          <Link to="/tv" className="group border border-line p-8 transition-colors hover:bg-cream">
            <p className="eyebrow">Sjónvarp</p>
            <p className="mt-3 font-display text-3xl"><span className="link-u">Skreytum Hús TV</span></p>
          </Link>
          <a href="https://www.skreytumhus.is/?page_id=3239" target="_blank" rel="noopener noreferrer" className="group border border-line p-8 transition-colors hover:bg-cream">
            <p className="eyebrow">Á skreytumhus.is</p>
            <p className="mt-3 inline-flex items-center gap-2 font-display text-3xl"><span className="link-u">Umfjöllun</span><ArrowUpRight size={18} aria-hidden /></p>
          </a>
          <a href={`mailto:${site.email}`} className="group border border-line p-8 transition-colors hover:bg-cream">
            <p className="eyebrow">Hafa samband</p>
            <p className="mt-3 inline-flex items-center gap-2 font-display text-3xl"><Mail size={18} aria-hidden /><span className="link-u">Senda póst</span></p>
          </a>
        </div>
      </section>
    </div>
  )
}
