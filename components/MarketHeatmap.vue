<template>
  <section class="mt-14">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 class="text-xl font-extrabold tracking-tight text-[#101d2d]">AI Market Heatmap</h2>
      <p class="text-xs font-medium text-[#5b7186]">All-time totals per niche</p>
    </div>
    <p class="mt-1 text-[13px] text-[#5b7186]">Relative niche size and AI-built share.</p>
    <div v-if="loading" class="mt-5 space-y-2">
      <div v-for="i in 6" :key="i" class="h-11 animate-pulse rounded-xl bg-[#e8f1f7]/70" />
    </div>
    <p v-else-if="failed" class="mt-5 text-sm text-[#5b7186]">Some analytics could not be loaded.</p>
    <div v-else class="mt-5">
      <!-- Mobile: stacked cards (no table squeeze, no horizontal scroll) -->
      <div class="space-y-2.5 sm:hidden">
        <NuxtLink
          v-for="row in rows"
          :key="row.category"
          :to="`/niche/${encodeURIComponent(row.category)}`"
          class="card-soft block px-4 py-3.5 transition-colors active:bg-[#f2f8fc]"
        >
          <span class="flex items-baseline justify-between gap-3">
            <span class="min-w-0 flex-1 break-words text-sm font-bold leading-snug text-[#101d2d]">
              {{ row.category }}
            </span>
            <span class="tnum shrink-0 whitespace-nowrap text-sm font-bold text-[#0277bd]">{{ formatPct(row.aiBuiltPct) }}</span>
          </span>
          <span class="mt-2.5 flex items-center gap-2.5">
            <span class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e8f1f7]">
              <span class="block h-full rounded-full bg-gradient-to-r from-[#0288d1] to-[#4fc3f7]" :style="{ width: barPct(row.total) + '%' }" />
            </span>
            <span class="tnum shrink-0 whitespace-nowrap text-[13px] font-extrabold text-[#101d2d]">{{ row.total ?? '—' }}</span>
            <span class="shrink-0 whitespace-nowrap text-[11px] font-semibold text-[#5b7186]">AI products</span>
          </span>
        </NuxtLink>
      </div>
      <!-- Desktop: table (unchanged semantics, whitespace-guarded) -->
      <div class="card-soft hidden overflow-hidden p-0 sm:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#e8f1f7] bg-[#f7fbfe] text-left text-[11px] font-bold uppercase tracking-widest text-[#5b7186]">
              <th scope="col" class="whitespace-nowrap px-5 py-3 font-bold">Niche</th>
              <th scope="col" class="whitespace-nowrap px-5 py-3 text-right font-bold">AI products</th>
              <th scope="col" class="whitespace-nowrap px-5 py-3 text-right font-bold">AI-built</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.category"
              class="border-t border-[#e8f1f7] transition-colors first:border-t-0 hover:bg-[#f2f8fc]"
            >
              <td class="min-w-0 px-5 py-3.5">
                <NuxtLink :to="`/niche/${encodeURIComponent(row.category)}`" class="break-words font-bold leading-snug text-[#101d2d] transition-colors hover:text-[#0288d1]">
                  {{ row.category }}
                </NuxtLink>
                <span class="ml-3 inline-block h-2 max-w-full shrink-0 rounded-full bg-gradient-to-r from-[#0288d1] to-[#4fc3f7] align-middle" :style="{ width: barWidth(row.total) + 'px' }" />
              </td>
              <td class="tnum whitespace-nowrap px-5 py-3.5 text-right font-extrabold text-[#101d2d]">{{ row.total ?? '—' }}</td>
              <td class="tnum whitespace-nowrap px-5 py-3.5 text-right font-bold text-[#0277bd]">{{ formatPct(row.aiBuiltPct) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
  return Math.round((total / maxTotal.value) * 96)
}

const maxTotal = computed(() => Math.max(1, ...rows.value.map(r => r.total ?? 0)))

function barPct(total: number | null): number {
  if (total === null || total === 0) return 0
  return Math.round((total / maxTotal.value) * 100)
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
