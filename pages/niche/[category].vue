<template>
  <main class="mx-auto max-w-[1200px] px-6 pb-16">
    <div class="pt-8">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-bold text-[#0288d1] transition-colors hover:text-[#0277bd]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2.5 4.5 7 9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t('niche.back') }}
      </NuxtLink>
    </div>

    <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-[#101d2d] sm:text-4xl">{{ category }}</h1>

    <p v-if="invalid" class="mt-8 rounded-2xl border border-dashed border-[#c5d8e6] bg-white px-5 py-8 text-center text-sm font-medium text-[#5b7186]">
      {{ t('niche.unknown') }}
    </p>
    <div v-else-if="loading" class="mt-8 space-y-3">
      <div class="h-14 w-40 animate-pulse rounded-md bg-[#e8f1f7]" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="i in 2" :key="i" class="h-32 animate-pulse rounded-2xl bg-[#e8f1f7]/70" />
      </div>
      <p class="text-sm text-[#5b7186]">{{ t('search.loading') }}</p>
    </div>
    <p v-else-if="error" role="alert" class="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
      {{ t('errors.unavailable') }}
    </p>

    <template v-else>
      <div class="mt-4 flex items-end gap-3">
        <p class="tnum bg-gradient-to-r to-[#101d2d] from-[#0288d1] bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          {{ total === null ? '—' : formatInt(total, tag) }}
        </p>
        <p class="pb-2 text-sm font-medium text-[#5b7186]">{{ t('results.matchingA') }}<br />{{ t('results.matchingB') }}</p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <MetricCard :label="t('metrics.newDetected')">
          <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ current === null ? '—' : formatInt(current, tag) }}</span>
          <span class="text-sm text-[#8aa0b2]">{{ t('metrics.lastPeriod') }}</span>
          <template #sub>
            {{ t('metrics.previous') }} {{ previous === null ? '—' : formatInt(previous, tag) }} ·
            {{ t('metrics.discovery') }} <DeltaPill :value="change" />
          </template>
        </MetricCard>
        <MetricCard :label="t('metrics.aiBuilt')">
          <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ formatPct(aiBuiltPct) }}</span>
          <span class="tnum text-sm text-[#8aa0b2]">{{ aiBuilt === null ? '—' : formatInt(aiBuilt, tag) }} / {{ total === null ? '—' : formatInt(total, tag) }}</span>
        </MetricCard>
      </div>

      <section class="mt-14">
        <div class="flex items-baseline justify-between">
          <h2 class="text-xl font-extrabold tracking-tight text-[#101d2d]">{{ t('niche.topSites') }}</h2>
          <p class="text-xs font-medium text-[#5b7186]">{{ t('products.top8') }}</p>
        </div>
        <div class="mt-5 flex flex-col sm:grid gap-4 sm:grid-cols-2">
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
import { useLocale } from '../../composables/useLocale'
import { formatInt } from '../../utils/locale'
import { AI_CATEGORIES } from '../../data/aiCategories'
import { offsetWindows } from '../../utils/dateRanges'
import { aiBuiltShare, discoveryChange } from '../../utils/metrics'
import type { FreeSerpSiteResult } from '../../types/freeserp'
import MetricCard from '../../components/MetricCard.vue'
import DeltaPill from '../../components/DeltaPill.vue'
import ProductCard from '../../components/ProductCard.vue'

const route = useRoute()
const { t, tag } = useLocale()
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
