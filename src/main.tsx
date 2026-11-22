import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource-variable/dm-sans/index.css'
import './index.css'
import { router } from './router'
import { installPreloadRecovery, preloadPages } from './lib/lazyPage'

installPreloadRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

// Sækja allar síður fyrirfram svo opinn flipi virki líka eftir nýja útgáfu
preloadPages()
