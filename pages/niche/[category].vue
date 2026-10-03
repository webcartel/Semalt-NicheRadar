<template>
  <main class="mx-auto max-w-[1200px] px-6 py-12">
    <NuxtLink to="/" class="text-sm text-neutral-500 underline">← Back to radar</NuxtLink>
    <h1 class="mt-4 text-3xl font-semibold tracking-tight">{{ category }}</h1>

    <p v-if="invalid" class="mt-8 text-sm text-neutral-500">
      Unknown niche. Categories come from the live FreeSerp taxonomy.
    </p>
    <p v-else-if="loading" class="mt-8 text-sm text-neutral-500">Searching FreeSerp...</p>
    <p v-else-if="error" class="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      FreeSerp is temporarily unavailable. Please try again.
    </p>

    <template v-else>
      <p class="mt-6 text-5xl font-semibold">{{ total }}</p>
      <p class="mt-1 text-sm text-neutral-500">matching AI products</p>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-neutral-200 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-400">Newly detected</p>
          <p class="mt-2 text-sm">Last period <span class="font-semibold">{{ current }}</span></p>
          <p class="text-sm">Previous <span class="font-semibold">{{ previous }}</span></p>
          <p class="mt-1 text-sm">
            New-site discovery <span class="font-semibold">{{ formatChange(change) }}</span>
          </p>
        </div>
        <div class="rounded-xl border border-neutral-200 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-400">AI-built signals</p>
          <p class="mt-2 text-sm"><span class="font-semibold">{{ aiBuilt }} / {{ total }}</span></p>
          <p class="text-2xl font-semibold">{{ formatPct(aiBuiltPct) }}</p>
        </div>
      </div>

      <h2 class="mt-10 text-lg font-semibold">Top sites</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <article v-for="p in products" :key="p.domain" class="rounded-xl border border-neutral-200 p-4">
          <p class="font-medium">{{ p.title }}</p>
          <p class="text-xs text-neutral-500">{{ p.domain }}</p>
          <p v-if="p.ai_summary" class="mt-2 line-clamp-3 text-sm text-neutral-600">{{ p.ai_summary }}</p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
            <span v-if="p.dr != null">DR {{ p.dr }}</span>
            <span v-if="p.went_live">Live since {{ formatMonth(p.went_live) }}</span>
            <span v-if="p.ai_source">AI-built: {{ p.ai_source }}</span>
          </div>
          <a :href="p.url" target="_blank" rel="noopener" class="mt-3 inline-block text-sm font-medium underline">Open site</a>
        </article>
      </div>
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

function formatChange(v: number | null): string {
  if (v === null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`
}

function formatPct(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(0)}%`
}

function formatMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
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
