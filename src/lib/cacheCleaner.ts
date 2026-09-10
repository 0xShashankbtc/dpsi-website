/**
 * CacheBuster & Freshness Enforcer
 * Runs on website load to automatically purge legacy service worker caches,
 * clear stale HTTP CacheStorage, and force immediate re-evaluation of fresh server data.
 */
export function enforceFreshCache() {
  if (typeof window === "undefined") return;

  const CACHE_VERSION_KEY = "dpsi_app_version";
  const CURRENT_APP_VERSION = "2026.09.10-v2";

  try {
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (cachedVersion !== CURRENT_APP_VERSION) {
      // 1. Unregister all existing Service Workers to clear stale client caches
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log("[CacheBuster] Legacy Service Worker unregistered:", registration.scope);
          }
        });
      }

      // 2. Clear CacheStorage caches
      if ("caches" in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((name) => {
              console.log("[CacheBuster] Purged CacheStorage cache:", name);
              return caches.delete(name);
            })
          );
        });
      }

      // 3. Clear sessionStorage
      sessionStorage.clear();

      // 4. Update stored version key
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_APP_VERSION);
      console.log("[CacheBuster] App version updated to", CURRENT_APP_VERSION);
    }
  } catch (e) {
    console.warn("[CacheBuster] Cache cleanup notice:", e);
  }
}
