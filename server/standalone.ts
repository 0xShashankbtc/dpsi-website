import "./instrument";
import dotenv from "dotenv";
dotenv.config();
if (typeof process !== "undefined" && typeof (process as any).loadEnvFile === "function") {
  try {
    (process as any).loadEnvFile();
  } catch {}
}
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs";
import path from "node:path";
import app from "./boot";

const publicDir = path.resolve(process.cwd(), "dist/public");

// When compiled and running in standalone production mode, serve static assets & SPA
if (fs.existsSync(publicDir)) {
  app.use(
    "/*",
    serveStatic({
      root: "./dist/public",
      rewriteRequestPath: (reqPath) => reqPath,
    })
  );

  // Fallback for HTML5 client-side routing (e.g. /about, /admissions, /admin, etc.)
  app.get("/*", (c) => {
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, "utf-8");
      return c.html(html);
    }
    return c.text("DPS Indirapuram Portal is starting...", 200);
  });
}

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 DPS Indirapuram Web Portal & CMS active at http://localhost:${port}`);
console.log(`🔒 Admin Portal accessible at http://localhost:${port}/admin`);

serve({
  fetch: app.fetch,
  port,
});
