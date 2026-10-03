<template>
  <section class="mt-12">
    <h2 class="text-lg font-semibold">AI Market Heatmap</h2>
    <p class="mt-1 text-xs text-neutral-400">Newly detected sites: last 7 days vs previous 7 days, per niche.</p>
    <p class="mt-1 text-xs text-neutral-400">Recent weeks undercount AI niches — fresh records receive AI categories with delay.</p>
    <p v-if="loading" class="mt-4 text-sm text-neutral-400">Loading...</p>
    <p v-else-if="failed" class="mt-4 text-sm text-neutral-400">Some analytics could not be loaded.</p>
    <table v-else class="mt-4 w-full text-sm">
      <thead>
        <tr class="text-left text-xs uppercase tracking-wide text-neutral-400">
          <th class="py-2 pr-4 font-medium">Niche</th>
          <th class="py-2 pr-4 text-right font-medium">Last 7d</th>
          <th class="py-2 pr-4 text-right font-medium">Prev 7d</th>
          <th class="py-2 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.category" class="border-t border-neutral-100">
          <td class="py-2 pr-4">{{ row.category }}</td>
          <td class="py-2 pr-4 text-right font-medium">{{ row.current ?? '—' }}</td>
          <td class="py-2 pr-4 text-right text-neutral-500">{{ row.previous ?? '—' }}</td>
          <td class="py-2 text-right font-medium">{{ formatChange(row.change) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFreeSerp } from '../composables/useFreeSerp'
import { HEATMAP_CATEGORIES } from '../data/aiCategories'
import { last7Windows } from '../utils/dateRanges'
import { discoveryChange } from '../utils/metrics'

interface Row {
  category: string
  current: number | null
  previous: number | null
  change: number | null
}

const rows = ref<Row[]>([])
const loading = ref(true)
const failed = ref(false)

function formatChange(v: number | null): string {
  if (v === null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`
}

onMounted(async () => {
  const api = useFreeSerp()
  const w = last7Windows()
  try {
    rows.value = await Promise.all(
      HEATMAP_CATEGORIES.map(async (category) => {
        const [cur, prev] = await Promise.all([
          api.countByCategory(category, w.current.from, w.current.to),
          api.countByCategory(category, w.previous.from, w.previous.to),
        ])
        return {
          category,
          current: cur.total,
          previous: prev.total,
          change: discoveryChange(cur.total, prev.total),
        }
      }),
    )
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>
