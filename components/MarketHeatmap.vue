<template>
  <section class="mt-12">
    <h2 class="text-lg font-semibold">AI Market Heatmap</h2>
    <p class="mt-1 text-xs text-neutral-400">Relative niche size and AI-built share. All-time totals per niche.</p>
    <p v-if="loading" class="mt-4 text-sm text-neutral-400">Loading...</p>
    <p v-else-if="failed" class="mt-4 text-sm text-neutral-400">Some analytics could not be loaded.</p>
    <table v-else class="mt-4 w-full text-sm">
      <thead>
        <tr class="text-left text-xs uppercase tracking-wide text-neutral-400">
          <th class="py-2 pr-4 font-medium">Niche</th>
          <th class="py-2 pr-4 text-right font-medium">AI products</th>
          <th class="py-2 text-right font-medium">AI-built</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.category" class="border-t border-neutral-100">
          <td class="py-2 pr-4">
            <NuxtLink :to="`/niche/${encodeURIComponent(row.category)}`" class="underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-600">
              {{ row.category }}
            </NuxtLink>
            <span class="ml-2 inline-block h-2 rounded bg-neutral-900 align-middle" :style="{ width: barWidth(row.total) + 'px' }" />
          </td>
          <td class="py-2 pr-4 text-right font-medium">{{ row.total ?? '—' }}</td>
          <td class="py-2 text-right font-medium">{{ formatPct(row.aiBuiltPct) }}</td>
        </tr>
      </tbody>
    </table>
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
