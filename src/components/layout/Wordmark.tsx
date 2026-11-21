/**
 * Merki Skreytum Hús (upprunalega merkið frá Soffíu, bakgrunnur fjarlægður).
 * `light` er útgáfa fyrir dökkan bakgrunn: svarti textinn verður fílabeinshvítur og útlínur detta út.
 * Hlutfall myndarinnar er 823 × 266.
 */
export function Wordmark({ compact = false, light = false, className }: { compact?: boolean; light?: boolean; className?: string }) {
  const file = light ? 'logo-light' : 'logo'
  const size = className ?? (compact ? 'h-[44px] lg:h-[52px]' : 'h-[52px] lg:h-[80px]')
  return (
    <picture className="block">
      <source srcSet={`/brand/${file}.webp`} type="image/webp" />
      <img
        src={`/brand/${file}.png`}
        alt="Skreytum Hús"
        width={823}
        height={266}
        decoding="async"
        className={`block w-auto max-w-none transition-[height] duration-500 ${size}`}
      />
    </picture>
  )
}
