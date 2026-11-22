import { useCallback, useEffect, useSyncExternalStore } from 'react'

/**
 * Like-staða greinar, sótt frá /api/likes/:id (Netlify-fall, sameiginleg talning).
 * Sama staða er deilt milli allra hnappa sömu greinar á síðunni.
 * Talan sem birtist kemur alltaf frá þjóninum; meðan beðið er eftir svari er hún aðeins
 * færð um ±1 til að sýna strax svörun, og færð til baka ef beiðnin mistekst.
 */
export type LikeStatus = 'loading' | 'ready' | 'unavailable'
export interface LikeView { status: LikeStatus; count: number; liked: boolean; pending: boolean; error: string | null }

const INITIAL: LikeView = { status: 'loading', count: 0, liked: false, pending: false, error: null }
const states = new Map<number, LikeView>()
const listeners = new Map<number, Set<() => void>>()
const loading = new Set<number>()

const get = (id: number) => states.get(id) ?? INITIAL
function set(id: number, next: Partial<LikeView>) {
  states.set(id, { ...get(id), ...next })
  listeners.get(id)?.forEach((l) => l())
}

async function call(id: number, init?: RequestInit) {
  const res = await fetch(`/api/likes/${id}`, { credentials: 'same-origin', ...init, headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) } })
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('json')) throw Object.assign(new Error('unavailable'), { status: res.status })
  const body = (await res.json()) as { count?: number; liked?: boolean; error?: string }
  if (!res.ok || typeof body.count !== 'number') throw Object.assign(new Error(body.error ?? 'unavailable'), { status: res.status })
  return { count: body.count, liked: !!body.liked }
}

function load(id: number) {
  if (loading.has(id) || get(id).status === 'ready') return
  loading.add(id)
  call(id)
    .then((r) => set(id, { status: 'ready', ...r }))
    .catch(() => set(id, { status: 'unavailable' }))
    .finally(() => loading.delete(id))
}

export function useLikes(postId: number) {
  const subscribe = useCallback((l: () => void) => {
    if (!listeners.has(postId)) listeners.set(postId, new Set())
    listeners.get(postId)!.add(l)
    return () => listeners.get(postId)?.delete(l)
  }, [postId])
  const view = useSyncExternalStore(subscribe, () => get(postId), () => INITIAL)

  useEffect(() => load(postId), [postId])

  const toggle = useCallback(async () => {
    const cur = get(postId)
    if (cur.status !== 'ready' || cur.pending) return // tvísmellur: ein beiðni í einu
    const want = !cur.liked
    set(postId, { pending: true, error: null, liked: want, count: Math.max(0, cur.count + (want ? 1 : -1)) })
    try {
      const r = await call(postId, { method: 'POST', body: JSON.stringify({ liked: want }) })
      set(postId, { ...r, pending: false })
    } catch (e) {
      const status = (e as { status?: number }).status
      set(postId, { liked: cur.liked, count: cur.count, pending: false, error: status === 429 ? 'Of margar tilraunir – reyndu aftur síðar.' : 'Tókst ekki að vista. Reyndu aftur.' })
    }
  }, [postId])

  return { ...view, toggle }
}
