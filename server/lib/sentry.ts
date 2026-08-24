/**
 * Sentry Backend (Node.js / Hono) Error Monitoring
 * Captures server-side errors: DB failures, tRPC exceptions, unhandled rejections
 *
 * SETUP: Add SENTRY_DSN to your Doppler / .env:
 *   SENTRY_DSN=https://xxxxx@o0.ingest.sentry.io/xxxxxxx
 */
import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentryBackend() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.info("ℹ️  SENTRY_DSN not set — backend error monitoring disabled.");
    return;
  }

  if (initialized) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "production",
    release: "dpsi-api@1.0.0",
    tracesSampleRate: 0.1,
  });

  initialized = true;
  console.log("✅ Sentry backend monitoring active.");
}

/**
 * Capture server-side error (e.g. in tRPC procedures, DB failures)
 */
export function captureServerError(
  error: unknown,
  context?: { route?: string; tenantId?: string; userId?: string }
) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || !initialized) return;

  Sentry.withScope((scope) => {
    if (context?.route) scope.setTag("route", context.route);
    if (context?.tenantId) scope.setTag("tenant", context.tenantId);
    if (context?.userId) scope.setUser({ id: context.userId });
    Sentry.captureException(error);
  });
}

export { Sentry };
