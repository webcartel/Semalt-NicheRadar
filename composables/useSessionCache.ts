// sessionStorage cache for GET API responses (SPEC §20).
// Key: `freeserp:<normalized-request-url>`, value: { timestamp, data }, TTL 5 min.

const PREFIX = 'freeserp:'
export const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry<T> {
  timestamp: number
  data: T
}

function keyFor(url: string): string {
  return `${PREFIX}${url}`
}

export function cacheGet<T>(url: string, now = Date.now()): T | null {
  try {
    const raw = sessionStorage.getItem(keyFor(url))
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (now - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(keyFor(url))
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function cacheSet<T>(url: string, data: T, now = Date.now()): void {
  try {
    const entry: CacheEntry<T> = { timestamp: now, data }
    sessionStorage.setItem(keyFor(url), JSON.stringify(entry))
  } catch {
    // Quota or SSR — caching is best-effort, never fatal.
  }
}

export function useSessionCache() {
  return { cacheGet, cacheSet, CACHE_TTL_MS }
}
