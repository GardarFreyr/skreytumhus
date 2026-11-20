/*
 * Íslensk dagsetninga- og talnasnið eru smíðuð handvirkt: sumir vafrar (t.d. Electron-
 * og sumir Android-vafrar) eru ekki með is-IS í Intl og myndu annars sýna ensku.
 */
const MONTHS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember']

/** WP skilar staðartíma án tímabeltis („2026-11-18T09:00:00“); lesum dagsetninguna beint úr strengnum. */
function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { y, m, d }
}

export const formatDate = (iso: string) => {
  const { y, m, d } = parts(iso)
  return `${d}. ${MONTHS[m - 1]} ${y}`
}
export const formatShortDate = (iso: string) => {
  const { y, m, d } = parts(iso)
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}
export const year = (iso: string) => parts(iso).y

/** 3169 → „3.169“ */
export function formatNumber(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Áætlaður lestrartími í mínútum (u.þ.b. 200 orð á mínútu). */
export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}
