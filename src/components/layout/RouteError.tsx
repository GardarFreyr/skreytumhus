import { useEffect, useState } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { isChunkLoadError, reloadForNewVersion } from '../../lib/lazyPage'

/**
 * Villumörk fyrir allar síður. Haus og fótur haldast; aðeins efnissvæðið sýnir skilaboðin.
 * Ef síðuskrá vantar eftir nýja útgáfu er síðan endurhlaðin sjálfkrafa (einu sinni).
 */
export function RouteError() {
  const error = useRouteError()
  const chunk = isChunkLoadError(error)
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    if (chunk && reloadForNewVersion()) setReloading(true)
  }, [chunk])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section className="wrap sec-y text-center">
        <p className="display text-4xl">Þessi síða fannst ekki</p>
        <Link to="/" className="btn btn-line mt-8">Á forsíðu</Link>
      </section>
    )
  }

  return (
    <section role="alert" className="wrap sec-y">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">{chunk ? 'Ný útgáfa' : 'Villa'}</p>
        <p className="display mt-5 text-[clamp(2.2rem,5vw,3.4rem)]">
          {chunk ? 'Síðan uppfærðist' : 'Æ, eitthvað fór úrskeiðis…'}
        </p>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {chunk
            ? reloading
              ? 'Sæki nýjustu útgáfuna…'
              : 'Vefurinn var uppfærður á meðan síðan var opin. Endurhladdu til að fá nýjustu útgáfuna.'
            : 'Ekki tókst að birta þessa síðu. Prófaðu að endurhlaða.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-dark" onClick={() => window.location.reload()}>Endurhlaða</button>
          <a href="/" className="btn btn-line">Á forsíðu</a>
        </div>
      </div>
    </section>
  )
}
