import type { FreeSerpResponse } from '../types/freeserp'

// Single place for all FreeSerp URL building + fetching.
// Vue components must NOT build request URLs directly.
//
// Base URL is resolved after the API probe (SPEC §24).
// Update FREESERP_BASE_URL once docs/API-NOTES.md confirms it.

const FREESERP_BASE_URL = 'https://freeserp.ai/api.php'

// Browser builds same-origin URLs (Nitro proxy in server/api/freeserp.get.ts)
// because the upstream answers browser fetch with a duplicated
// `Access-Control-Allow-Origin: *, *` header that browsers reject.
// Server-side / scripts keep using FREESERP_BASE_URL directly (no CORS there).

export function buildProxyUrl(params: SitesQuery): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v))
  }
  return `/api/freeserp?${usp.toString()}`
}

export interface SitesQuery {
  q?: string
  ai_startups?: 0 | 1
  ai?: 0 | 1
  ai_categories?: string
  ai_source?: string
  from_date?: string // YYYY-MM-DD
  to_date?: string
  dr_min?: number
  dr_max?: number
  sort?: 'relevance'
  size?: number
  from?: number
  stats?: 0 | 1
  help?: 0 | 1
}

export function buildSitesUrl(params: SitesQuery): string {
  const usp = new URLSearchParams({ index: 'sites' })
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v))
  }
  return `${FREESERP_BASE_URL}?${usp.toString()}`
}

async function getJson(url: string): Promise<FreeSerpResponse> {
  // TODO: add sessionStorage cache (5 min TTL) + concurrency pool (max 3).
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FreeSerp unavailable (HTTP ${res.status})`)
  return res.json() as Promise<FreeSerpResponse>
}

export const freeserp = {
  baseUrl: FREESERP_BASE_URL,
  searchSites: (q: SitesQuery) => getJson(buildSitesUrl(q)),
  getStats: () => getJson(buildSitesUrl({ stats: 1 })),
  countByDateRange: (q: string, from_date: string, to_date: string) =>
    getJson(buildSitesUrl({ q, ai_startups: 1, size: 1, from_date, to_date })),
  countByDrRange: (q: string, dr_min: number, dr_max: number) =>
    getJson(buildSitesUrl({ q, ai_startups: 1, size: 1, dr_min, dr_max })),
  countByCategory: (category: string, from_date: string, to_date: string) =>
    getJson(
      buildSitesUrl({ ai_startups: 1, ai_categories: category, size: 1, from_date, to_date }),
    ),
  countAiBuilt: (q: string) =>
    getJson(buildSitesUrl({ q, ai_startups: 1, ai: 1, size: 1 })),
}
