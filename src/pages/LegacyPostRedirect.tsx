import { Navigate, useParams } from 'react-router'
import { useArticleById } from '../features/articles/hooks'
import { NotFoundError } from '../lib/wp'
import { ErrorState } from '../components/ui/States'
import NotFoundPage from './NotFoundPage'

/**
 * Gamlar slóðir WordPress (?p=123) og innri tenglar í greinum.
 * Í framleiðslu ætti þetta að vera 301-áframsending á þjóni — sjá docs/migration.md.
 */
export default function LegacyPostRedirect() {
  const { id } = useParams()
  const n = Number(id)
  const state = useArticleById(Number.isFinite(n) && n > 0 ? n : null)
  if (!Number.isFinite(n) || n <= 0) return <NotFoundPage />
  if (state.status === 'error') return state.error instanceof NotFoundError ? <NotFoundPage /> : <ErrorState error={state.error} />
  if (state.data) return <Navigate to={`/greinar/${state.data.slug}`} replace />
  return <div className="min-h-[60vh]" aria-busy="true" aria-label="Opna grein" />
}
