import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import { idlePrefetchTopRoutes } from './lib/routePreloader'
import { trpc } from './providers/trpc'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Academics = lazy(() => import('./pages/Academics'))
const Admissions = lazy(() => import('./pages/Admissions'))
const Facilities = lazy(() => import('./pages/Facilities'))
const NewsEvents = lazy(() => import('./pages/NewsEvents'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Contact = lazy(() => import('./pages/Contact'))
const DynamicPage = lazy(() => import('./pages/DynamicPage'))
const TransferCertificate = lazy(() => import('./pages/TransferCertificate'))
const Admin = lazy(() => import('./pages/AdminCMS'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Smooth scroll to top or hash anchor on route change
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const id = hash.replace(/^#/, '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])
  return null
}

// Lightweight, sleek page loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-opacity duration-300">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-emerald-500/10 animate-pulse" />
      </div>
      <p className="text-xs font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
        DPS Indirapuram
      </p>
    </div>
  )
}

export default function App() {
  const utils = trpc.useUtils()

  useEffect(() => {
    idlePrefetchTopRoutes(utils)
  }, [utils])

  return (
    <ErrorBoundary fallbackTitle="Application Interface Notice">
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/news-events" element={<NewsEvents />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tc" element={<TransferCertificate />} />
          <Route path="/transfer-certificate" element={<TransferCertificate />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
          <Route path="/:slug" element={<DynamicPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}