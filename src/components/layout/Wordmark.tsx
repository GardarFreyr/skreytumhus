/**
 * Orðmerki: „Skreytum Hús…“ — þrípunkturinn er úr upprunalega merkinu og
 * einkennir líka skrifstíl Soffíu, svo hann fær að halda sér.
 */
export function Wordmark({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className={`font-display font-medium tracking-[0.005em] transition-[font-size] duration-500 ${compact ? 'text-[26px] lg:text-[30px]' : 'text-[30px] lg:text-[44px]'}`}>
        Skreytum Hús<span className={light ? 'text-sage' : 'text-taupe'}>…</span>
      </span>
      {!compact && (
        <span className={`mt-2 hidden pl-[0.4em] text-[9.5px] uppercase tracking-[0.4em] lg:block ${light ? 'text-ivory/70' : 'text-muted'}`}>
          Allt um heimilið · síðan 2010
        </span>
      )}
    </span>
  )
}
