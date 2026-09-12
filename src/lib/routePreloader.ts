const routeLoaders: Record<string, () => Promise<unknown>> = {
  "/about": () => import("@/pages/About"),
  "/academics": () => import("@/pages/Academics"),
  "/admissions": () => import("@/pages/Admissions"),
  "/facilities": () => import("@/pages/Facilities"),
  "/news-events": () => import("@/pages/NewsEvents"),
  "/gallery": () => import("@/pages/Gallery"),
  "/contact": () => import("@/pages/Contact"),
  "/transfer-certificate": () => import("@/pages/TransferCertificate"),
  "/tc": () => import("@/pages/TransferCertificate"),
};

const preloaded = new Set<string>();

/**
 * Speculatively prefetch tRPC data for a given route before navigation.
 */
export function prefetchRouteData(href?: string, utils?: any) {
  if (!href || !utils) return;
  const path = href.split("#")[0].split("?")[0].toLowerCase();
  try {
    switch (path) {
      case "/about":
        utils.cms?.listLeadership?.prefetch();
        utils.cms?.listCoreValues?.prefetch();
        utils.cms?.listTimeline?.prefetch();
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/academics":
        utils.cms?.listDepartments?.prefetch();
        utils.cms?.listBoardResults?.prefetch();
        utils.cms?.listStreamDistributions?.prefetch();
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/admissions":
        utils.cms?.listAdmissionSteps?.prefetch();
        utils.cms?.listFaqs?.prefetch({ category: "Admissions" });
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/facilities":
        utils.cms?.listFacilities?.prefetch();
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/news-events":
        utils.cms?.listActivities?.prefetch();
        utils.events?.list?.prefetch();
        utils.news?.featured?.prefetch();
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/gallery":
        utils.cms?.listVideos?.prefetch();
        break;
      case "/contact":
        utils.cms?.getSiteSettings?.prefetch();
        break;
      case "/transfer-certificate":
      case "/tc":
        break;
    }
  } catch {
    // Non-blocking speculative prefetch
  }
}

/**
 * Speculatively preload the JavaScript chunk and tRPC database data for a route on link hover or touch intent.
 * Once preloaded, clicking the link navigates instantaneously (0.00ms delay).
 */
export function preloadRoute(href?: string, utils?: any) {
  if (!href || typeof href !== "string") return;
  const path = href.split("#")[0].split("?")[0].toLowerCase();

  // Prefetch data if utils provided
  if (utils) {
    prefetchRouteData(path, utils);
  }

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
export function idlePrefetchTopRoutes(utils?: any) {
  if (typeof window === "undefined") return;
  const run = () => {
    preloadRoute("/admissions", utils);
    preloadRoute("/about", utils);
    preloadRoute("/academics", utils);
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(run, { timeout: 3500 });
  } else {
    setTimeout(run, 2000);
  }
}
