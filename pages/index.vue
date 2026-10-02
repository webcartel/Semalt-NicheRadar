<template>
  <main class="mx-auto max-w-[1200px] px-6 py-12">
    <h1 class="text-3xl font-semibold tracking-tight">AI Niche Radar</h1>
    <p class="mt-2 text-neutral-600">
      Explore new AI products, niche activity and competitive signals.
    </p>

    <form class="mt-6 flex max-w-xl gap-2" @submit.prevent="onSubmit">
      <input
        v-model="input"
        type="text"
        placeholder="AI resume builder"
        class="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-neutral-900"
      />
      <button
        type="submit"
        :disabled="radar.searching.value"
        class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Check niche
      </button>
    </form>
    <div class="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
      <button
        v-for="ex in examples"
        :key="ex"
        class="rounded-full border border-neutral-200 px-3 py-1 hover:border-neutral-400"
        @click="runExample(ex)"
      >
        {{ ex }}
      </button>
    </div>

    <p v-if="radar.searching.value" class="mt-8 text-sm text-neutral-500">
      Searching FreeSerp...
    </p>

    <p v-if="radar.searchError.value" class="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ radar.searchError.value }}
    </p>

    <template v-if="hasResult">
      <section class="mt-10">
        <p class="text-5xl font-semibold">{{ radar.matchingTotal.value }}</p>
        <p class="mt-1 text-sm text-neutral-500">matching AI products</p>
      </section>

      <section class="mt-8 grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-neutral-200 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-400">Newly detected</p>
          <p v-if="radar.trendLoading.value" class="mt-2 text-sm text-neutral-400">Loading...</p>
          <p v-else-if="radar.trendError.value" class="mt-2 text-sm text-neutral-400">Some analytics could not be loaded.</p>
          <template v-else>
            <p class="mt-2 text-sm">Last period <span class="font-semibold">{{ radar.currentPeriod.value }}</span></p>
            <p class="text-sm">Previous <span class="font-semibold">{{ radar.previousPeriod.value }}</span></p>
            <p class="mt-1 text-sm">
              New-site discovery
              <span class="font-semibold">{{ formatChange(radar.trendChange.value) }}</span>
            </p>
          </template>
        </div>

        <div class="rounded-xl border border-neutral-200 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-400">Domain Rating distribution</p>
          <p v-if="radar.drLoading.value" class="mt-2 text-sm text-neutral-400">Loading...</p>
          <p v-else-if="radar.drError.value" class="mt-2 text-sm text-neutral-400">Some analytics could not be loaded.</p>
          <template v-else>
            <div v-for="b in radar.drBuckets.value" :key="b.label" class="mt-1 flex items-center gap-2 text-sm">
              <span class="w-14 shrink-0 text-neutral-500">{{ b.label }}</span>
              <span class="h-2 rounded bg-neutral-900" :style="{ width: drBarWidth(b.total) + 'px' }" />
              <span class="font-medium">{{ b.total }}</span>
            </div>
            <p class="mt-1 text-sm text-neutral-500">Unknown <span class="font-medium text-neutral-700">{{ radar.drUnknown.value }}</span></p>
          </template>
        </div>

        <div class="rounded-xl border border-neutral-200 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-400">AI-built signals</p>
          <p v-if="radar.aiBuiltLoading.value" class="mt-2 text-sm text-neutral-400">Loading...</p>
          <p v-else-if="radar.aiBuiltError.value" class="mt-2 text-sm text-neutral-400">Some analytics could not be loaded.</p>
          <template v-else>
            <p class="mt-2 text-sm"><span class="font-semibold">{{ radar.aiBuiltTotal.value }} / {{ radar.matchingTotal.value }}</span></p>
            <p class="text-2xl font-semibold">{{ formatPct(radar.aiBuiltPct.value) }}</p>
            <div v-for="s in radar.aiBuiltBySource.value" :key="s.source" class="flex justify-between text-sm text-neutral-600">
              <span>{{ s.source }}</span><span class="font-medium">{{ s.total }}</span>
            </div>
          </template>
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold">Matching products</h2>
        <p v-if="emptyResult" class="mt-2 text-sm text-neutral-500">
          No AI products found for this query. Try a broader phrase.
        </p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <article v-for="p in radar.products.value" :key="p.domain" class="rounded-xl border border-neutral-200 p-4">
            <p class="font-medium">{{ p.title }}</p>
            <p class="text-xs text-neutral-500">{{ p.domain }}</p>
            <p v-if="p.ai_summary" class="mt-2 line-clamp-3 text-sm text-neutral-600">{{ p.ai_summary }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
              <span v-for="c in asArray(p.ai_categories)" :key="c" class="rounded-full bg-neutral-100 px-2 py-0.5">{{ c }}</span>
              <span v-if="p.dr != null">DR {{ p.dr }}</span>
              <span v-if="p.went_live">Live since {{ formatMonth(p.went_live) }}</span>
              <span v-if="p.ai_source">AI-built: {{ p.ai_source }}</span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" class="mt-3 inline-block text-sm font-medium underline">Open site</a>
          </article>
        </div>
      </section>

      <p class="mt-10 text-xs leading-relaxed text-neutral-400">
        Data: FreeSerp Main site index. `went_live` is when FreeSerp first confirmed
        the site reachable — not an official launch date. Fresh records may have
        incomplete enrichment. DR can be unavailable for new domains.
      </p>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNicheRadar } from '../composables/useNicheRadar'

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

function formatChange(v: number | null): string {
  if (v === null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`
}

function formatPct(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(0)}%`
}

function drBarWidth(total: number | null): number {
  if (total === null || total === 0) return 0
  const max = Math.max(1, ...radar.drBuckets.value.map(b => b.total ?? 0))
  return Math.round((total / max) * 96)
}

function asArray(v: string[] | string | null | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function formatMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>
