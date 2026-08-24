/**
 * Sentry Backend Instrumentation — Node.js (Hono) Serverless Optimized
 * MUST be imported before all other modules
 *
 * Platform:     Node.js (ESM) + Hono on Vercel Serverless
 * Organisation: orangefuturetech
 */
import * as Sentry from "@sentry/node";

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  "https://4af9b9eba8a785eebe4a2f825c232e87@o4511965668179968.ingest.us.sentry.io/4511965680304128";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  release: "dpsi-api@1.0.0",

  // 100% in dev, 10% in production for performance spans
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Disabled in serverless to prevent Node inspector socket from keeping lambda open
  includeLocalVariables: false,

  // Enable structured logging API
  enableLogs: true,
});

export { Sentry };
export { captureException, captureMessage, withScope } from "@sentry/node";
