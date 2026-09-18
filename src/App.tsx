import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import { idlePrefetchTopRoutes } from './lib/routePreloader'
import { trpc } from './providers/trpc'
import { Toaster } from 'sonner'
import Home from './pages/Home'

/**
 * Self-healing lazy loader for dynamic chunks.
 * If a deployment replaces chunk hashes and a client has a stale cache or broken Service Worker,
 * this catches the error, unregisters old workers, purges CacheStorage, and performs a single clean reload.
 */
function safeLazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err: any) {
      const isChunkOrFetchError =
        err?.message?.includes('dynamically imported module') ||
        err?.message?.includes('Loading chunk') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('MIME type')

      if (isChunkOrFetchError && typeof window !== 'undefined') {
        const retryKey = 'dpsi_chunk_retry_' + window.location.pathname
        const lastRetry = sessionStorage.getItem(retryKey)
        const now = Date.now()
        if (!lastRetry || now - Number(lastRetry) > 15000) {
          sessionStorage.setItem(retryKey, String(now))
          if ('serviceWorker' in navigator) {
            try {
              const regs = await navigator.serviceWorker.getRegistrations()
              for (const reg of regs) {
                await reg.unregister()
              }
            } catch {}
          }
          if ('caches' in window) {
            try {
              const keys = await caches.keys()
              for (const k of keys) {
                await caches.delete(k)
              }
            } catch {}
          }
          window.location.reload()
          return new Promise<{ default: T }>(() => {})
        }
      }
      throw err
    }
  })
}

const About = safeLazy(() => import('./pages/About'))
const Academics = safeLazy(() => import('./pages/Academics'))
const Admissions = safeLazy(() => import('./pages/Admissions'))
const Facilities = safeLazy(() => import('./pages/Facilities'))
const NewsEvents = safeLazy(() => import('./pages/NewsEvents'))
const Gallery = safeLazy(() => import('./pages/Gallery'))
const Contact = safeLazy(() => import('./pages/Contact'))
const DynamicPage = safeLazy(() => import('./pages/DynamicPage'))
const TransferCertificate = safeLazy(() => import('./pages/TransferCertificate'))
const Admin = safeLazy(() => import('./pages/AdminCMS'))
const Login = safeLazy(() => import('./pages/Login'))
const NotFound = safeLazy(() => import('./pages/NotFound'))

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
      <Toaster richColors position="top-right" closeButton duration={4000} />
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
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
          <Route path="/:slug" element={<DynamicPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}