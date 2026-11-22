import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { Layout } from './components/layout/Layout'
import HomePage from './pages/HomePage'

// Forsíðan hleðst strax; aðrar síður eru sóttar þegar þeirra er þörf
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))
const LegacyPostRedirect = lazy(() => import('./pages/LegacyPostRedirect'))
const InspirationPage = lazy(() => import('./pages/InspirationPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const TvPage = lazy(() => import('./pages/TvPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'greinar', element: <ArticlesPage /> },
      { path: 'greinar/:slug', element: <ArticlePage /> },
      { path: 'flokkur/id/:id', element: <ArticlesPage /> },
      { path: 'flokkur/:slug', element: <ArticlesPage /> },
      { path: 'innblastur', element: <InspirationPage /> },
      { path: 'herbergisbreytingar', element: <ProjectsPage /> },
      { path: 'herbergisbreytingar/:slug', element: <ArticlePage variant="project" /> },
      { path: 'tv', element: <TvPage /> },
      { path: 'um-mig', element: <AboutPage /> },
      { path: 'samband', element: <ContactPage /> },
      { path: 'leit', element: <SearchPage /> },
      // Gamlar WordPress-slóðir (?p=123) → /p/123 → /greinar/<slug>
      { path: 'p/:id', element: <LegacyPostRedirect /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
