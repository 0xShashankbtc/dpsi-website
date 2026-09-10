/**
 * Delhi Public School Indirapuram (DPSI)
 * High-Performance In-Memory TTL Cache for rapid instant response times (sub-1ms).
 * Caches read-heavy CMS data and invalidates immediately upon mutations.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const freshData = await fetcher();
  memoryCache.set(key, {
    data: freshData,
    expiresAt: now + ttlSeconds * 1000,
  });

  return freshData;
}

export function invalidateCache(keyOrPrefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      memoryCache.delete(key);
    }
  }
}

export function clearAllCache(): void {
  memoryCache.clear();
}
