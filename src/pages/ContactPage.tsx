import { useState } from 'react'
import { Link } from 'react-router'
import { Mail } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { site } from '../data/site'

const SUBJECTS = ['Almenn fyrirspurn', 'Fyrirspurn um herbergisbreytingu', 'Samstarf', 'Fjölmiðlar']

/**
 * Engin póstþjónusta er tengd þessari demo-útgáfu, svo formið býr til tölvupóst
 * í póstforriti notandans (mailto). Ekkert er sent héðan og engin „tókst“-skilaboð eru sýnd.
 * Sjá docs/architecture.md um hvernig tengja má raunverulegt form.
 */
export default function ContactPage() {
  useSeo({ title: 'Samband', description: 'Hafðu samband við Soffíu Dögg hjá Skreytum Hús.' })
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n— ${name}`.trim())}`

  return (
    <div className="wrap pt-10 sec-b lg:pt-16">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="eyebrow">Samband</p>
          <h1 className="display mt-5 text-[clamp(3rem,7vw,6.4rem)]">Segðu <em className="text-taupe-ink">hæ…</em></h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-muted">
            Fyrirspurnir um herbergisbreytingar, samstarf eða bara spjall um heimilið — Soffía svarar í tölvupósti.
          </p>
          <a href={`mailto:${site.email}`} className="mt-10 inline-flex items-center gap-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] text-charcoal hover:text-taupe-ink">
            <Mail size={22} strokeWidth={1.4} aria-hidden /> <span className="link-u">{site.email}</span>
          </a>
          <p className="mt-10 max-w-md text-[14px] leading-relaxed text-muted">
            Ef þú hefur hug á aðstoð við að breyta herbergi má sjá fyrri verkefni undir <Link to="/herbergisbreytingar" className="underline underline-offset-4">Herbergisbreytingum</Link>.
          </p>
        </div>

        <form
          className="lg:col-span-6 lg:col-start-7"
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = mailto
          }}
        >
          <fieldset className="flex flex-col gap-7 border-t border-line pt-8">
            <legend className="eyebrow mb-6">Skrifa skilaboð</legend>
            <div>
              <label htmlFor="c-subject" className="text-[13px] font-medium">Efni</label>
              <select id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 h-13 w-full rounded-none border-b border-stone bg-transparent text-[17px] outline-none focus:border-charcoal">
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-name" className="text-[13px] font-medium">Nafn</label>
              <input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-13 w-full border-b border-stone bg-transparent text-[17px] outline-none focus:border-charcoal" />
            </div>
            <div>
              <label htmlFor="c-msg" className="text-[13px] font-medium">Skilaboð <span className="text-muted">(nauðsynlegt)</span></label>
              <textarea id="c-msg" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full resize-y border-b border-stone bg-transparent py-2 text-[17px] leading-relaxed outline-none focus:border-charcoal" />
            </div>
            <div className="flex flex-col gap-3">
              <button type="submit" className="btn btn-dark self-start">
                <Mail size={16} aria-hidden /> Opna í póstforriti
              </button>
              <p className="text-[13px] text-muted">
                Skilaboðin opnast sem tölvupóstur í þínu eigin póstforriti, stíluð á {site.email}. Ekkert er sent fyrr en þú ýtir á „senda“ þar.
              </p>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}
