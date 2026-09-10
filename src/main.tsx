import "./instrument"; // ← MUST be first import — initializes Sentry before any other code

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { setupCleanConsole } from "@/lib/utils"
import { enforceFreshCache } from "@/lib/cacheCleaner"
import { reactErrorHandler } from "@sentry/react"
import App from './App.tsx'

setupCleanConsole()
enforceFreshCache()

// React 19: pass reactErrorHandler to all three createRoot options
// This ensures Sentry captures errors from all React error boundaries
createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)