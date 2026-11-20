import { useEffect, useState } from 'react'

/** Einfalt minni fyrir svör innan setunnar svo flakk fram og til baka sé tafarlaust. */
const cache = new Map<string, unknown>()

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error }

/**
 * Sækir gögn með lykli. Sami lykill = sama svar úr minni.
 * `key` null þýðir „ekki sækja enn“.
 */
export function useAsync<T>(key: string | null, loader: (signal: AbortSignal) => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>(() =>
    key && cache.has(key) ? { status: 'success', data: cache.get(key) as T } : { status: 'loading' },
  )

  useEffect(() => {
    if (!key) return
    if (cache.has(key)) {
      setState({ status: 'success', data: cache.get(key) as T })
      return
    }
    const ctrl = new AbortController()
    setState({ status: 'loading' })
    loader(ctrl.signal)
      .then((data) => {
        cache.set(key, data)
        if (!ctrl.signal.aborted) setState({ status: 'success', data })
      })
      .catch((error: Error) => {
        if (!ctrl.signal.aborted) setState({ status: 'error', error })
      })
    return () => ctrl.abort()
    // loader er ný fall-tilvísun í hverri teiknun; lykillinn ræður
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
