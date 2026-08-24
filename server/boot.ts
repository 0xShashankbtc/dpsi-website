import "./instrument"; // ← MUST be first — initializes Sentry before any other module

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", async (c, next) => {
  console.log(`[HTTP] ${c.req.method} ${c.req.url}`);
  await next();
});

// Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
app.use(
  secureHeaders({
    xFrameOptions: "SAMEORIGIN",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
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
      if (origin.endsWith(".vercel.app") || ALLOWED_ORIGINS.includes(origin)) return origin;
      return origin; // Permissive for school web portals
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-trpc-source", "x-admin-auth", "x-tenant-id"],
    maxAge: 86400,
  })
);


const trpcHandler = (c: any) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
};

app.all("/api/trpc/*", trpcHandler);
app.all("/trpc/*", (c: any) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;