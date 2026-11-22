import { Link } from 'react-router'
import { ArrowUpRight, Mail } from 'lucide-react'
import { mainNav, site } from '../../data/site'
import { topics } from '../../data/taxonomy'
import { Wordmark } from './Wordmark'

export function Footer() {
  return (
    <footer className="mt-auto bg-night text-ivory/85">
      <div className="wrap sec-t pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" title="Forsíða" className="inline-block"><Wordmark white className="h-[60px] lg:h-[79px]" /></Link>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ivory/70">
              Íslenskt heimilisblogg um skreytingar og breytingar, fegrun heimilisins og almennt þá hluti sem gleðja. Skrifað af Soffíu Dögg síðan í september 2010.
            </p>
            <a href={`mailto:${site.email}`} className="mt-8 inline-flex items-center gap-3 font-display text-2xl text-ivory hover:text-sage">
              <Mail size={18} strokeWidth={1.5} aria-hidden /> {site.email}
            </a>
          </div>

          <nav aria-label="Vefurinn" className="lg:col-span-2">
            <p className="eyebrow !text-ivory/60">Vefurinn</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              {mainNav.map((n) => (
                <li key={n.to}><Link className="link-u hover:text-ivory" to={n.to}>{n.label}</Link></li>
              ))}
              <li><Link className="link-u hover:text-ivory" to="/efnisord">Efnisorð</Link></li>
              <li><Link className="link-u hover:text-ivory" to="/samband">Samband</Link></li>
            </ul>
          </nav>

          <nav aria-label="Efnisflokkar" className="lg:col-span-2">
            <p className="eyebrow !text-ivory/60">Flokkar</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              {topics.map((t) => (
                <li key={t.slug}><Link className="link-u hover:text-ivory" to={`/flokkur/${t.slug}`}>{t.name}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="eyebrow !text-ivory/60">Gott að vita</p>
            <ul className="mt-5 space-y-4 text-[14px] leading-relaxed text-ivory/70">
              <li>Sumar færslur eru unnar í samstarfi við fyrirtæki og eru þá merktar <span className="text-ivory">Samstarf</span>.</li>
              <li>Myndir og texti eru eign Skreytum Hús nema annað sé tekið fram.</li>
              {site.social.map((s) => (
                <li key={s.href}><a href={s.href} className="inline-flex items-center gap-1 text-ivory" target="_blank" rel="noopener noreferrer">{s.label}<ArrowUpRight size={14} aria-hidden /></a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-ivory/15 pt-8 text-[12.5px] text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Skreytumhús.is · Allur réttur áskilinn</p>
          <p className="max-w-xl md:text-right">
            Hönnunartillaga. Efni er lesið beint af{' '}
            <a href={site.liveUrl} className="underline decoration-ivory/40 underline-offset-2 hover:text-ivory">skreytumhus.is</a>
            , sem helst óbreyttur. Þessi útgáfa notar engar vafrakökur og safnar engum gögnum.
          </p>
        </div>
      </div>
    </footer>
  )
}
