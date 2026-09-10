import "./instrument"; // ← MUST be first — initializes Sentry before any other module

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { getDbConnection, resolveDbName } from "./lib/mongodb";

// Eager non-blocking database pre-warm on boot so connection is instant on first request
if (process.env.MONGODB_URI) {
  getDbConnection(resolveDbName("dpsi", "main")).catch((err) => {
    console.warn("[Boot] Background DB pre-warm notice:", err.message);
  });
}

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", async (c, next) => {
  console.log(`[HTTP] ${c.req.method} ${c.req.url}`);
  await next();
});

// Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, CSP, Referrer Policy)
app.use(
  secureHeaders({
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    xFrameOptions: "SAMEORIGIN",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    crossOriginResourcePolicy: "cross-origin",
    crossOriginOpenerPolicy: "same-origin-allow-popups",
  })
);

// CORS configuration
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://dpsindirapuram.com",
  "https://www.dpsindirapuram.com",
  "https://dpsindirapuram.vercel.app",
  "https://dpsi-website.vercel.app",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*"; // allow server-to-server / curl
      if (
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".dpsindirapuram.com")
      ) {
        return origin;
      }
      return null; // Explicitly reject unauthorized origins
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-trpc-source", "x-admin-auth", "x-tenant-id"],
    maxAge: 86400,
  })
);

import { tenantContextStorage } from "./models/cmsSchemas";

const trpcHandler = async (c: any) => {
  const ctx = await createContext({ req: c.req.raw, resHeaders: new Headers(), info: {} as any });
  const res = await tenantContextStorage.run(ctx.tenantId, () => {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: () => ctx,
    });
  });
  // Set appropriate caching headers: public queries get Edge CDN acceleration (sub-20ms) while admin requests bypass cache
  const headers = new Headers(res.headers);
  const isPublicQuery =
    c.req.method === "GET" &&
    !c.req.header("authorization") &&
    c.req.header("x-admin-auth") !== "true";

  if (isPublicQuery) {
    headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
  } else {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};

app.all("/api/trpc/*", trpcHandler);
app.all("/trpc/*", async (c: any) => {
  const ctx = await createContext({ req: c.req.raw, resHeaders: new Headers(), info: {} as any });
  const res = await tenantContextStorage.run(ctx.tenantId, () => {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: () => ctx,
    });
  });
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});

// Deep Health & Diagnostic Check
app.get("/api/health", async (c) => {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  try {
    const { getDbConnection, resolveDbName } = await import("./lib/mongodb");
    const conn = await getDbConnection(resolveDbName("dpsi", "main"));
    dbStatus = conn.readyState === 1 ? "connected" : "connecting";
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  const responseTimeMs = Date.now() - startTime;
  const isHealthy = dbStatus === "connected" || dbStatus === "connecting";

  return c.json(
    {
      status: isHealthy ? "ok" : "degraded",
      environment: process.env.NODE_ENV || "production",
      database: dbStatus,
      r2Storage: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? "configured" : "unconfigured",
      responseTimeMs,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

app.get("/api/ping", (c) => c.text("pong", 200));
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;