/**
 * Sentry Instrumentation — MUST be the first import in src/main.tsx
 *
 * Platform:     React 19 + Vite
 * Organisation: orangefuturetech
 * Project:      javascript-react-router
 * DSN:          https://4af9b9eba8a785eebe4a2f825c232e87@o4511965668179968.ingest.us.sentry.io/4511965680304128
 */
import * as Sentry from "@sentry/react";
import { reactRouterV7BrowserTracingIntegration } from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN ||
  "https://08fc42b0aa8123348987d264d2c88b99@o4511965668179968.ingest.us.sentry.io/4511965673029632";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: import.meta.env.MODE || "production",
  release: "dpsi-website@1.0.0",

  integrations: [
    // React Router v7 SPA navigation tracing
    reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    // Session Replay — record error sessions fully, 10% of normal sessions
    Sentry.replayIntegration({
      maskAllText: false,  // School site has no sensitive text to hide
      blockAllMedia: false,
    }),
  ],

  // Performance: 100% in dev, 10% in production
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,

  // Propagate traces to our own API
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/dpsindirapuram\.vercel\.app/,
    /^https:\/\/dpsindirapuram\.com/,
    /^https:\/\/dpsi-website\.vercel\.app/,
  ],

  // Session Replay sample rates: 0 for normal browsing to avoid main-thread scroll jank, 1.0 on errors
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Enable structured logging API (Sentry.logger.*)
  enableLogs: true,

  // Filter non-actionable browser errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    /^Network Error$/,
    /^Failed to fetch$/,
    /^Load failed$/,
  ],

  // Tag every event with the active school tenant
  initialScope: {
    tags: {
      platform: "dpsi-website",
      org: "orangefuturetech",
      tenant:
        typeof window !== "undefined"
          ? localStorage.getItem("dpsi_admin_tenant") || "dpsi"
          : "dpsi",
    },
  },
});

// Re-export Sentry for use across the app
export { Sentry };
export { captureException, captureMessage, withScope } from "@sentry/react";
