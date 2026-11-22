import { useAsync } from '../../lib/useAsync'
import { loadTermIndex, type TermIndex } from '../../lib/terms'

/** Allir flokkar og merki úr WordPress (sótt einu sinni á setu). */
export function useTermIndex() {
  return useAsync<TermIndex>('term-index', () => loadTermIndex())
}
