<template>
  <section class="mt-14">
    <div class="flex items-baseline justify-between">
      <h2 class="text-xl font-bold tracking-tight">AI Market Heatmap</h2>
      <p class="text-xs text-zinc-400">All-time totals per niche</p>
    </div>
    <p class="mt-1 text-[13px] text-zinc-400">Relative niche size and AI-built share.</p>
    <div v-if="loading" class="mt-5 space-y-2">
      <div v-for="i in 6" :key="i" class="h-11 animate-pulse rounded-xl bg-zinc-200/50" />
    </div>
    <p v-else-if="failed" class="mt-5 text-sm text-zinc-400">Some analytics could not be loaded.</p>
    <div v-else class="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-100 text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            <th class="px-5 py-3 font-semibold">Niche</th>
            <th class="px-5 py-3 text-right font-semibold">AI products</th>
            <th class="px-5 py-3 text-right font-semibold">AI-built</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.category"
            class="border-t border-zinc-100 transition-colors first:border-t-0 hover:bg-zinc-50"
          >
            <td class="px-5 py-3">
              <NuxtLink :to="`/niche/${encodeURIComponent(row.category)}`" class="font-medium transition-colors hover:text-blue-600">
                {{ row.category }}
              </NuxtLink>
              <span class="ml-3 inline-block h-2 rounded-full bg-zinc-900 align-middle" :style="{ width: barWidth(row.total) + 'px' }" />
            </td>
            <td class="tnum px-5 py-3 text-right font-bold">{{ row.total ?? '—' }}</td>
            <td class="tnum px-5 py-3 text-right font-semibold">{{ formatPct(row.aiBuiltPct) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFreeSerp } from '../composables/useFreeSerp'
import { HEATMAP_CATEGORIES } from '../data/aiCategories'
import { aiBuiltShare } from '../utils/metrics'

// Decision B (2026-10-03): 7d/prev-7d discovery windows are unmeasurable —
// AI enrichment lags ~7 weeks behind discovery (see docs/API-NOTES.md),
// so category-sliced recent windows return ~0. The heatmap shows all-time
// niche size + AI-built share instead. Both compose live and verified.

interface Row {
  category: string
  total: number | null
  aiBuiltPct: number | null
}

const rows = ref<Row[]>([])
const loading = ref(true)
const failed = ref(false)

function formatPct(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(0)}%`
}

function barWidth(total: number | null): number {
  if (total === null || total === 0) return 0
  const max = Math.max(1, ...rows.value.map(r => r.total ?? 0))
  return Math.round((total / max) * 96)
}

onMounted(async () => {
  const api = useFreeSerp()
  try {
    const loaded = await Promise.all(
      HEATMAP_CATEGORIES.map(async (category) => {
        const [totalRes, aiRes] = await Promise.all([
          api.searchSites({ ai_startups: 1, ai_categories: category, size: 1 }),
          api.searchSites({ ai_startups: 1, ai: 1, ai_categories: category, size: 1 }),
        ])
        return {
          category,
          total: totalRes.total,
          aiBuiltPct: aiBuiltShare(aiRes.total, totalRes.total),
        }
      }),
    )
    rows.value = loaded.sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>
