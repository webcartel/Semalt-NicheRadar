import { buildSitesUrl, type SitesQuery } from '../services/freeserp'
import type { FreeSerpResponse } from '../types/freeserp'
import { cacheGet, cacheSet } from './useSessionCache'

// Thin data layer over services/freeserp.ts for Vue components (SPEC §22).
// Components call these helpers — never build URLs themselves.
// Concurrency: max 3 in flight (SPEC §21). Cache: sessionStorage 5 min (SPEC §20).

const MAX_CONCURRENT = 3

let inFlight = 0
const queue: Array<() => void> = []

function acquire(): Promise<void> {
  if (inFlight < MAX_CONCURRENT) {
    inFlight += 1
    return Promise.resolve()
  }
  return new Promise((resolve) => queue.push(() => {
    inFlight += 1
    resolve()
  }))
}

function release(): void {
  inFlight -= 1
  const next = queue.shift()
  if (next) next()
}

async function fetchSites(params: SitesQuery): Promise<FreeSerpResponse> {
  const url = buildSitesUrl(params)
  const cached = cacheGet<FreeSerpResponse>(url)
  if (cached) return cached
  await acquire()
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`FreeSerp unavailable (HTTP ${res.status})`)
    const data = (await res.json()) as FreeSerpResponse
    cacheSet(url, data)
    return data
  } finally {
    release()
  }
}

export function useFreeSerp() {
  return {
    searchSites: (params: SitesQuery) => fetchSites(params),
    getStats: () => fetchSites({ stats: 1 }),
    countByDateRange: (q: string, from_date: string, to_date: string) =>
      fetchSites({ q, ai_startups: 1, size: 1, from_date, to_date }),
    countByDrRange: (q: string, dr_min: number, dr_max: number) =>
      fetchSites({ q, ai_startups: 1, size: 1, dr_min, dr_max }),
    countByCategory: (category: string, from_date: string, to_date: string) =>
      fetchSites({ ai_startups: 1, ai_categories: category, size: 1, from_date, to_date }),
    countAiBuilt: (q: string) =>
      fetchSites({ q, ai_startups: 1, ai: 1, size: 1 }),
    countByAiSource: (q: string, ai_source: string) =>
      fetchSites({ q, ai_startups: 1, ai: 1, ai_source, size: 1 }),
  }
}
