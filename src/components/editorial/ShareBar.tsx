import { useState } from 'react'
import { Check, Link2, Mail, Share2 } from 'lucide-react'

/** Deiling vísar á upprunalegu færsluna á skreytumhus.is — ekki á demo-útgáfuna. */
export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const canNative = typeof navigator !== 'undefined' && 'share' in navigator

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Afritaðu slóðina:', url)
    }
  }

  const btn = 'inline-flex min-h-11 items-center gap-2 rounded-full border border-stone px-4 text-[13px] transition-colors hover:border-charcoal'
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Deila grein">
      <span className="eyebrow mr-2">Deila</span>
      {canNative && (
        <button type="button" className={btn} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <Share2 size={15} aria-hidden /> Deila
        </button>
      )}
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
      <a className={btn} href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
        Pinterest
      </a>
      <a className={btn} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>
        <Mail size={15} aria-hidden /> Tölvupóstur
      </a>
      <button type="button" className={btn} onClick={copy}>
        {copied ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />}
        <span aria-live="polite">{copied ? 'Afritað' : 'Afrita slóð'}</span>
      </button>
    </div>
  )
}
