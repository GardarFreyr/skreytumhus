import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, search])
  return null
}

function PageFallback() {
  return <div className="min-h-[70vh]" aria-busy="true" />
}

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#efni" className="sr-only z-50 bg-charcoal px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Fara beint í efni
      </a>
      <ScrollToTop />
      <Header />
      <main id="efni" key={pathname} className="animate-fade">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
