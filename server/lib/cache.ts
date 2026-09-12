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
const MAX_CACHE_ENTRIES = 2000;

function enforceMaxLimit(): void {
  if (memoryCache.size < MAX_CACHE_ENTRIES) return;
  const now = Date.now();
  // First, purge any expired entries
  for (const [k, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(k);
    }
  }
  // If still at capacity, evict oldest 20% of entries (FIFO/LRU Map order)
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const toDelete = Math.ceil(MAX_CACHE_ENTRIES * 0.2);
    let count = 0;
    for (const k of memoryCache.keys()) {
      memoryCache.delete(k);
      count++;
      if (count >= toDelete) break;
    }
  }
}

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
  enforceMaxLimit();
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
