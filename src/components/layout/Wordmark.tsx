/**
 * Merki Skreytum Hús (upprunalega merkið frá Soffíu, bakgrunnur fjarlægður).
 * `white` er hvíta útgáfan fyrir dökkan bakgrunn: allir stafir og hjörtun hvít,
 * unnin úr hvítu útgáfu merkisins frá eiganda (gegnsær bakgrunnur, enginn skuggi).
 */
const FILES = {
  color: { file: 'logo', width: 823, height: 266 },
  white: { file: 'logo-white', width: 1335, height: 417 },
}

export function Wordmark({ compact = false, white = false, className }: { compact?: boolean; white?: boolean; className?: string }) {
  const { file, width, height } = FILES[white ? 'white' : 'color']
  const size = className ?? (compact ? 'h-[44px] lg:h-[52px]' : 'h-[52px] lg:h-[80px]')
  return (
    <picture className="block">
      <source srcSet={`/brand/${file}.webp`} type="image/webp" />
      <img
        src={`/brand/${file}.png`}
        alt="Skreytum Hús"
        width={width}
        height={height}
        decoding="async"
        className={`block w-auto max-w-none transition-[height] duration-500 ${size}`}
      />
    </picture>
  )
}
