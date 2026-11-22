/**
 * Síður sem hlaðast eftir þörfum (React.lazy) – þolnar gagnvart nýjum útgáfum.
 *
 * Vandinn: við hverja útgáfu fá JS-skrár síðna ný nöfn (hash) og þær gömlu hverfa af
 * Netlify. Flipi sem var opnaður fyrir útgáfuna reynir að sækja gömlu skrána og fær villu
 * („Failed to fetch dynamically imported module“).
 *
 * Lausnin, í þremur lögum:
 *  1. Allar síður eru sóttar fyrirfram í rólegheitum eftir fyrstu hleðslu (`preloadPages`),
 *     svo opinn flipi á þær þegar í minni og þarf ekki gömlu skrárnar síðar.
 *  2. Ef sókn mistekst samt er reynt aftur einu sinni, og svo er síðan endurhlaðin
 *     (sækir nýja index.html og nýju skrárnar) – en aðeins einu sinni á hverjum 30 sek.
 *     svo aldrei verði endalaus endurhleðsla.
 *  3. Ef það dugar ekki grípur villumörk (RouteError) villuna og sýnir skýr skilaboð.
 */
import { lazy, type ComponentType } from 'react'

const RELOAD_KEY = 'sh:chunk-reload-at'
/** Forhleðslur: sækja skrána án endurhleðslu ef það mistekst (það reynir þá aftur við smell). */
const preloaders: (() => void)[] = []

export function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err)
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|ChunkLoadError|MIME type/i.test(msg)
}

/** Endurhleður síðuna einu sinni til að sækja nýjustu útgáfuna. Skilar false ef það var nýbúið að gerast. */
export function reloadForNewVersion(): boolean {
  let last = 0
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0
  } catch {
    /* sessionStorage ekki aðgengilegt: endurhlöðum samt einu sinni (sjá hér að neðan) */
  }
  if (Date.now() - last < 30_000) return false
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    if ((window as { __shReloaded?: boolean }).__shReloaded) return false
    ;(window as { __shReloaded?: boolean }).__shReloaded = true
  }
  window.location.reload()
  return true
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function lazyPage<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  let cached: Promise<{ default: T }> | null = null
  const attempt = () => {
    cached ??= load()
      .catch(async (err) => {
        // Tímabundin netvilla? Reynum aftur einu sinni.
        await wait(400)
        return load().catch(() => {
          throw err
        })
      })
      .catch((err) => {
        cached = null
        if (isChunkLoadError(err) && reloadForNewVersion()) {
          // Síðan er að endurhlaðast; bíðum svo villuskilaboð blikki ekki á meðan
          return new Promise<never>(() => {})
        }
        throw err
      })
    return cached
  }
  preloaders.push(() => {
    if (cached) return
    const p = load()
    cached = p
    p.catch(() => {
      if (cached === p) cached = null
    })
  })
  return lazy(attempt)
}

/** Sækir allar síður fyrirfram þegar vafrinn hefur ekkert annað að gera (~45 KB samtals). */
export function preloadPages() {
  const run = () => preloaders.forEach((p) => p())
  const idle = (window as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  const start = () => (idle ? idle(run, { timeout: 4000 }) : setTimeout(run, 2000))
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

/** Ef Vite nær ekki að forhlaða skrá (t.d. CSS fyrir síðu) eftir útgáfu: endurhlaða einu sinni. */
export function installPreloadRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault()
  })
}
