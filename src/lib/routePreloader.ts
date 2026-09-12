const routeLoaders: Record<string, () => Promise<unknown>> = {
  "/about": () => import("@/pages/About"),
  "/academics": () => import("@/pages/Academics"),
  "/admissions": () => import("@/pages/Admissions"),
  "/facilities": () => import("@/pages/Facilities"),
  "/news-events": () => import("@/pages/NewsEvents"),
  "/gallery": () => import("@/pages/Gallery"),
  "/contact": () => import("@/pages/Contact"),
  "/transfer-certificate": () => import("@/pages/TransferCertificate"),
};

const preloaded = new Set<string>();

/**
 * Speculatively preload the JavaScript chunk for a route on link hover or intent.
 * Once preloaded, clicking the link navigates instantly (0ms delay).
 */
export function preloadRoute(href?: string) {
  if (!href || typeof href !== "string") return;
  const path = href.split("#")[0].split("?")[0].toLowerCase();
  if (preloaded.has(path)) return;

  const loader = routeLoaders[path];
  if (loader) {
    preloaded.add(path);
    loader().catch(() => {
      preloaded.delete(path);
    });
  }
}

/**
 * Silently prefetch the top 3 high-intent student/parent destination pages
 * during idle browser cycles (requestIdleCallback) after initial boot.
 */
export function idlePrefetchTopRoutes() {
  if (typeof window === "undefined") return;
  const run = () => {
    preloadRoute("/admissions");
    preloadRoute("/about");
    preloadRoute("/academics");
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(run, { timeout: 3500 });
  } else {
    setTimeout(run, 2000);
  }
}
