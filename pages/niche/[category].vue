<template>
  <main class="mx-auto max-w-[1200px] px-6 pb-16">
    <div class="pt-8">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2.5 4.5 7 9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back to radar
      </NuxtLink>
    </div>

    <h1 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{{ category }}</h1>

    <p v-if="invalid" class="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center text-sm text-zinc-500">
      Unknown niche. Categories come from the live FreeSerp taxonomy.
    </p>
    <div v-else-if="loading" class="mt-8 space-y-3">
      <div class="h-14 w-40 animate-pulse rounded-md bg-zinc-200/70" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="i in 2" :key="i" class="h-32 animate-pulse rounded-2xl bg-zinc-200/50" />
      </div>
      <p class="text-sm text-zinc-400">Searching FreeSerp...</p>
    </div>
    <p v-else-if="error" role="alert" class="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      FreeSerp is temporarily unavailable. Please try again.
    </p>

    <template v-else>
      <div class="mt-4 flex items-end gap-3">
        <p class="tnum text-6xl font-extrabold tracking-tight">{{ total }}</p>
        <p class="pb-2 text-sm text-zinc-500">matching<br />AI products</p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Newly detected">
          <span class="tnum text-3xl font-bold">{{ current }}</span>
          <span class="text-sm text-zinc-400">last period</span>
          <template #sub>
            Previous {{ previous }} ·
            New-site discovery <DeltaPill :value="change" />
          </template>
        </MetricCard>
        <MetricCard label="AI-built signals">
          <span class="tnum text-3xl font-bold">{{ formatPct(aiBuiltPct) }}</span>
          <span class="tnum text-sm text-zinc-400">{{ aiBuilt }} / {{ total }}</span>
        </MetricCard>
      </div>

      <section class="mt-12">
        <div class="flex items-baseline justify-between">
          <h2 class="text-xl font-bold tracking-tight">Top sites</h2>
          <p class="text-xs text-zinc-400">Top 8 by relevance</p>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <ProductCard v-for="p in products" :key="p.domain" :product="p" />
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFreeSerp } from '../../composables/useFreeSerp'
import { AI_CATEGORIES } from '../../data/aiCategories'
import { offsetWindows } from '../../utils/dateRanges'
import { aiBuiltShare, discoveryChange } from '../../utils/metrics'
import type { FreeSerpSiteResult } from '../../types/freeserp'
import MetricCard from '../../components/MetricCard.vue'
import DeltaPill from '../../components/DeltaPill.vue'
import ProductCard from '../../components/ProductCard.vue'

const route = useRoute()
const category = computed(() => String(route.params.category ?? ''))
const invalid = computed(() => !AI_CATEGORIES.includes(category.value))

const loading = ref(true)
const error = ref(false)
const total = ref<number | null>(null)
const current = ref<number | null>(null)
const previous = ref<number | null>(null)
const change = ref<number | null>(null)
const aiBuilt = ref<number | null>(null)
const aiBuiltPct = ref<number | null>(null)
const products = ref<FreeSerpSiteResult[]>([])

function formatPct(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(0)}%`
}

onMounted(async () => {
  if (invalid.value) return
  const api = useFreeSerp()
  const w = offsetWindows()
  const cat = category.value
  try {
    const [totalRes, curRes, prevRes, aiRes, listRes] = await Promise.all([
      api.searchSites({ ai_startups: 1, ai_categories: cat, size: 1 }),
      api.countByCategory(cat, w.current.from, w.current.to),
      api.countByCategory(cat, w.previous.from, w.previous.to),
      api.searchSites({ ai_startups: 1, ai: 1, ai_categories: cat, size: 1 }),
      api.searchSites({ ai_startups: 1, ai_categories: cat, sort: 'relevance', size: 8 }),
    ])
    total.value = totalRes.total
    current.value = curRes.total
    previous.value = prevRes.total
    change.value = discoveryChange(curRes.total, prevRes.total)
    aiBuilt.value = aiRes.total
    aiBuiltPct.value = aiBuiltShare(aiRes.total, totalRes.total)
    products.value = listRes.results ?? []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
