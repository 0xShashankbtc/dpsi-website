import "./instrument"; // ← MUST be first — initializes Sentry before any other module

import dotenv from "dotenv";
dotenv.config();
if (typeof process !== "undefined" && typeof (process as any).loadEnvFile === "function") {
  try {
    (process as any).loadEnvFile();
  } catch {}
}

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { getDbConnection, resolveDbName } from "./lib/mongodb";

// Eager non-blocking database pre-warm, critical index verification & auto-seeding on fresh system boot
if (process.env.MONGODB_URI) {
  getDbConnection(resolveDbName("dpsi", "main"))
    .then(async () => {
      const { ensureCriticalIndexes, getMainModels } = await import("./models/cmsSchemas");
      await ensureCriticalIndexes("dpsi");

      // Auto-bootstrap fresh deployment if database has zero site settings
      try {
        const { SiteSettings } = await getMainModels("dpsi");
        const count = await SiteSettings.countDocuments();
        if (count === 0) {
          console.log("[Boot] Fresh system detected — Auto-seeding initial database structure & admin portal...");
          const { seedDatabase } = await import("./lib/seedDatabase");
          await seedDatabase("dpsi");
          console.log("[Boot] Fresh system database seeding completed!");
        }
      } catch (seedErr: any) {
        console.warn("[Boot] Auto-seed check notice:", seedErr?.message || seedErr);
      }
    })
    .catch((err) => {
      console.warn("[Boot] Background DB pre-warm notice:", err.message);
    });
}

const app = new Hono<{ Bindings: HttpBindings }>();

// High-speed response compression (Gzip / Deflate) for mobile network acceleration
app.use("*", compress());

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
      if (!origin) return "https://dpsindirapuram.vercel.app";
      return origin;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-trpc-source",
      "x-admin-auth",
      "x-tenant-id",
      "trpc-accept",
      "trpc-batch-mode",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
  })
);

import { tenantContextStorage } from "./models/cmsSchemas";

const createTrpcHandler = (endpoint: string) => async (c: any) => {
  const ctx = await createContext({ req: c.req.raw, resHeaders: new Headers(), info: {} as any });
  const res = await tenantContextStorage.run(ctx.tenantId, () => {
    return fetchRequestHandler({
      endpoint,
      req: c.req.raw,
      router: appRouter,
      createContext: () => ctx,
    });
  });
  // Set appropriate caching headers: public queries get Edge CDN acceleration (sub-20ms) while admin requests bypass cache
  const headers = new Headers(res.headers);

  // Guarantee explicit CORS headers on every response
  const clientOrigin = c.req.header("origin");
  if (clientOrigin) {
    headers.set("Access-Control-Allow-Origin", clientOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  const isPublicQuery =
    c.req.method === "GET" &&
    !c.req.header("authorization") &&
    c.req.header("x-admin-auth") !== "true";

  if (isPublicQuery) {
    headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400");
    headers.set("Vary", "Accept-Encoding");
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

app.all("/api/trpc/*", createTrpcHandler("/api/trpc"));
app.all("/trpc/*", createTrpcHandler("/trpc"));

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