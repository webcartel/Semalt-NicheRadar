<template>
  <main class="mx-auto max-w-[1200px] px-6 pb-16">
    <section class="mx-auto max-w-2xl pt-14 text-center sm:pt-20">
      <p class="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live FreeSerp discovery data
      </p>
      <h1 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">AI Niche Radar</h1>
      <p class="mt-3 text-base text-zinc-500 sm:text-lg">
        Explore new AI products, niche activity and competitive signals.
      </p>

      <form
        class="mt-8 flex flex-col gap-2 sm:flex-row"
        @submit.prevent="onSubmit"
      >
        <input
          v-model="input"
          type="text"
          placeholder="Try: AI meeting notes"
          aria-label="AI niche to check"
          class="h-12 flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
        />
        <button
          type="submit"
          :disabled="radar.searching.value || !input.trim()"
          class="h-12 shrink-0 cursor-pointer rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check niche
        </button>
      </form>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <button
          v-for="ex in examples"
          :key="ex"
          class="cursor-pointer rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          @click="runExample(ex)"
        >
          {{ ex }}
        </button>
      </div>
    </section>

    <div v-if="radar.searching.value" class="mx-auto mt-12 max-w-3xl space-y-3">
      <div class="h-5 w-48 animate-pulse rounded-md bg-zinc-200/70" />
      <div class="grid gap-4 sm:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded-2xl bg-zinc-200/50" />
      </div>
      <p class="text-center text-sm text-zinc-400">Searching FreeSerp...</p>
    </div>

    <p v-if="radar.searchError.value" role="alert" class="mx-auto mt-12 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ radar.searchError.value }}
    </p>

    <template v-if="hasResult">
      <section class="mt-12 border-t border-zinc-200 pt-10">
        <p class="text-xs font-medium text-zinc-400">
          Results for <span class="font-semibold text-zinc-700">“{{ radar.submittedQuery.value }}”</span>
        </p>
        <div class="mt-2 flex items-end gap-3">
          <p class="tnum text-6xl font-extrabold tracking-tight">{{ radar.matchingTotal.value }}</p>
          <p class="pb-2 text-sm text-zinc-500">matching<br />AI products</p>
        </div>
      </section>

      <section class="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Newly detected" :loading="radar.trendLoading.value" :failed="radar.trendError.value">
          <span class="tnum text-3xl font-bold">{{ radar.currentPeriod.value ?? '—' }}</span>
          <span class="text-sm text-zinc-400">last period</span>
          <template #sub>
            Previous {{ radar.previousPeriod.value ?? '—' }} ·
            New-site discovery <DeltaPill :value="radar.trendChange.value" />
          </template>
        </MetricCard>

        <MetricCard label="Domain Rating" :loading="radar.drLoading.value" :failed="radar.drError.value">
          <div class="w-full space-y-1.5 pt-1">
            <div v-for="b in radar.drBuckets.value" :key="b.label" class="flex items-center gap-2 text-[13px]">
              <span class="tnum w-12 shrink-0 text-zinc-400">{{ b.label }}</span>
              <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <span class="block h-full rounded-full bg-zinc-900" :style="{ width: drBarPct(b.total) + '%' }" />
              </span>
              <span class="tnum w-8 shrink-0 text-right font-semibold">{{ b.total }}</span>
            </div>
            <p class="pt-1 text-[13px] text-zinc-400">
              Unknown <span class="tnum font-semibold text-zinc-600">{{ radar.drUnknown.value }}</span>
            </p>
          </div>
        </MetricCard>

        <MetricCard label="AI-built signals" :loading="radar.aiBuiltLoading.value" :failed="radar.aiBuiltError.value">
          <span class="tnum text-3xl font-bold">{{ formatPct(radar.aiBuiltPct.value) }}</span>
          <span class="tnum text-sm text-zinc-400">{{ radar.aiBuiltTotal.value }} / {{ radar.matchingTotal.value }}</span>
          <template #sub>
            <span class="block space-y-1 pt-1">
              <span v-for="s in radar.aiBuiltBySource.value" :key="s.source" class="flex items-center justify-between gap-4">
                <span>{{ s.source }}</span>
                <span class="tnum font-semibold text-zinc-700">{{ s.total }}</span>
              </span>
            </span>
          </template>
        </MetricCard>
      </section>

      <section class="mt-12">
        <div class="flex items-baseline justify-between">
          <h2 class="text-xl font-bold tracking-tight">Matching products</h2>
          <p class="text-xs text-zinc-400">Top 8 by relevance</p>
        </div>
        <p v-if="emptyResult" class="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center text-sm text-zinc-500">
          No AI products found for this query. Try a broader phrase.
        </p>
        <div v-else class="mt-5 grid gap-4 sm:grid-cols-2">
          <ProductCard v-for="p in radar.products.value" :key="p.domain" :product="p" />
        </div>
      </section>
    </template>

    <MarketPulse />
    <MarketHeatmap />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNicheRadar } from '../composables/useNicheRadar'
import MarketHeatmap from '../components/MarketHeatmap.vue'
import MarketPulse from '../components/MarketPulse.vue'
import MetricCard from '../components/MetricCard.vue'
import DeltaPill from '../components/DeltaPill.vue'
import ProductCard from '../components/ProductCard.vue'

const radar = useNicheRadar()
const input = ref('')

const examples = [
  'AI resume builder',
  'AI meeting notes',
  'AI video generator',
  'AI customer support',
]

const hasResult = computed(() => radar.matchingTotal.value !== null && !radar.searching.value)
const emptyResult = computed(
  () => hasResult.value && radar.matchingTotal.value === 0,
)

function onSubmit() {
  void radar.checkNiche(input.value)
}

function runExample(ex: string) {
  input.value = ex
  void radar.checkNiche(ex)
}

function formatPct(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(0)}%`
}

function drBarPct(total: number | null): number {
  if (total === null || total === 0) return 0
  const max = Math.max(1, ...radar.drBuckets.value.map(b => b.total ?? 0))
  return Math.round((total / max) * 100)
}

onMounted(() => {
  const saved = radar.restore()
  if (saved) input.value = saved
})
</script>
