import { ref } from 'vue'
import { useFreeSerp } from './useFreeSerp'
import { normalizeQuery } from '../utils/normalizeQuery'
import { offsetWindows } from '../utils/dateRanges'
import { aiBuiltShare, discoveryChange } from '../utils/metrics'
import type { FreeSerpSiteResult } from '../types/freeserp'

// Orchestrates the Idea Check flow (SPEC §§8–14).
// SPEC §18: every block owns its loading state — a slow DR bucket
// must not block the main result. SPEC §19: partial failures degrade,
// the main result still renders.

// DR buckets from SPEC §12.
export const DR_BUCKETS = [
  { label: '0–4', min: 0, max: 4 },
  { label: '5–9', min: 5, max: 9 },
  { label: '10–19', min: 10, max: 19 },
  { label: '20–29', min: 20, max: 29 },
  { label: '30–49', min: 30, max: 49 },
  { label: '50–100', min: 50, max: 100 },
] as const

// AI sources for the breakdown (SPEC §13). Values observed live 2026-10-03.
export const AI_SOURCES = ['lovable', 'v0', 'bolt', 'base44', 'ai_likely'] as const

export interface DrBucketResult {
  label: string
  total: number | null
}

export function useNicheRadar() {
  const api = useFreeSerp()

  const query = ref('')
  const submittedQuery = ref('')

  // P0 — main result.
  const searching = ref(false)
  const searchError = ref<string | null>(null)
  const matchingTotal = ref<number | null>(null)
  const products = ref<FreeSerpSiteResult[]>([])

  // P1 — analytics blocks, each with its own state.
  const trendLoading = ref(false)
  const trendError = ref(false)
  const currentPeriod = ref<number | null>(null)
  const previousPeriod = ref<number | null>(null)
  const trendChange = ref<number | null>(null)

  const drLoading = ref(false)
  const drError = ref(false)
  const drBuckets = ref<DrBucketResult[]>([])
  const drUnknown = ref<number | null>(null)

  const aiBuiltLoading = ref(false)
  const aiBuiltError = ref(false)
  const aiBuiltTotal = ref<number | null>(null)
  const aiBuiltPct = ref<number | null>(null)
  const aiBuiltBySource = ref<Array<{ source: string, total: number | null }>>([])

  function reset() {
    searchError.value = null
    matchingTotal.value = null
    products.value = []
    trendError.value = false
    currentPeriod.value = null
    previousPeriod.value = null
    trendChange.value = null
    drError.value = false
    drBuckets.value = []
    drUnknown.value = null
    aiBuiltError.value = false
    aiBuiltTotal.value = null
    aiBuiltPct.value = null
    aiBuiltBySource.value = []
  }

  async function runTrend(q: string) {
    trendLoading.value = true
    try {
      const w = offsetWindows()
      const [cur, prev] = await Promise.all([
        api.countByDateRange(q, w.current.from, w.current.to),
        api.countByDateRange(q, w.previous.from, w.previous.to),
      ])
      currentPeriod.value = cur.total
      previousPeriod.value = prev.total
      trendChange.value = discoveryChange(cur.total, prev.total)
    } catch {
      trendError.value = true
    } finally {
      trendLoading.value = false
    }
  }

  async function runDr(q: string, matchTotal: number) {
    drLoading.value = true
    try {
      const results = await Promise.all(
        DR_BUCKETS.map(async b => ({
          label: b.label,
          total: (await api.countByDrRange(q, b.min, b.max)).total,
        })),
      )
      drBuckets.value = results
      drUnknown.value = matchTotal - results.reduce((s, r) => s + r.total, 0)
    } catch {
      drError.value = true
    } finally {
      drLoading.value = false
    }
  }

  async function runAiBuilt(q: string, matchTotal: number) {
    aiBuiltLoading.value = true
    try {
      const totalRes = await api.countAiBuilt(q)
      aiBuiltTotal.value = totalRes.total
      aiBuiltPct.value = aiBuiltShare(totalRes.total, matchTotal)
      aiBuiltBySource.value = await Promise.all(
        AI_SOURCES.map(async source => ({
          source,
          total: (await api.countByAiSource(q, source)).total,
        })),
      )
    } catch {
      aiBuiltError.value = true
    } finally {
      aiBuiltLoading.value = false
    }
  }

  async function checkNiche(input: string) {
    const q = normalizeQuery(input)
    if (!q) return
    query.value = q
    submittedQuery.value = q
    reset()
    searching.value = true
    try {
      const [matchRes, listRes] = await Promise.all([
        api.searchSites({ q, ai_startups: 1, size: 1 }),
        api.searchSites({ q, ai_startups: 1, sort: 'relevance', size: 8 }),
      ])
      matchingTotal.value = matchRes.total
      products.value = listRes.results ?? []
      // P1 blocks run without blocking each other (pool caps at 3).
      void runTrend(q)
      void runDr(q, matchRes.total)
      void runAiBuilt(q, matchRes.total)
    } catch {
      searchError.value = 'FreeSerp is temporarily unavailable. Please try again.'
    } finally {
      searching.value = false
    }
  }

  return {
    query,
    submittedQuery,
    searching,
    searchError,
    matchingTotal,
    products,
    trendLoading,
    trendError,
    currentPeriod,
    previousPeriod,
    trendChange,
    drLoading,
    drError,
    drBuckets,
    drUnknown,
    aiBuiltLoading,
    aiBuiltError,
    aiBuiltTotal,
    aiBuiltPct,
    aiBuiltBySource,
    checkNiche,
  }
}
