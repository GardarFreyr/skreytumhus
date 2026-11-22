import { createBrowserRouter } from 'react-router'
import { Layout } from './components/layout/Layout'
import HomePage from './pages/HomePage'
import { RouteError } from './components/layout/RouteError'
import { lazyPage } from './lib/lazyPage'

// Forsíðan hleðst strax; aðrar síður eru sóttar þegar þeirra er þörf
const ArticlesPage = lazyPage(() => import('./pages/ArticlesPage'))
const ArticlePage = lazyPage(() => import('./pages/ArticlePage'))
const LegacyPostRedirect = lazyPage(() => import('./pages/LegacyPostRedirect'))
const InspirationPage = lazyPage(() => import('./pages/InspirationPage'))
const ProjectsPage = lazyPage(() => import('./pages/ProjectsPage'))
const TvPage = lazyPage(() => import('./pages/TvPage'))
const AboutPage = lazyPage(() => import('./pages/AboutPage'))
const ContactPage = lazyPage(() => import('./pages/ContactPage'))
const SearchPage = lazyPage(() => import('./pages/SearchPage'))
const TopicsPage = lazyPage(() => import('./pages/TopicsPage'))
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        // Villumörk innan útlitsins: haus og fótur haldast ef síða bregst
        errorElement: <RouteError />,
        children: [
      { index: true, element: <HomePage /> },
      { path: 'greinar', element: <ArticlesPage /> },
      { path: 'greinar/:slug', element: <ArticlePage /> },
      { path: 'flokkur/id/:id', element: <ArticlesPage /> },
      { path: 'efni/:term', element: <ArticlesPage /> },
      { path: 'efnisord', element: <TopicsPage /> },
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
    ],
  },
])
