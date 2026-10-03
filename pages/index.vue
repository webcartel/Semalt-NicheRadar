<template>
  <section class="hero-grid sm:-mx-6 -mt-px px-6 pb-24 pt-16 sm:pt-20">
    <div class="mx-auto max-w-2xl text-center">
      <p class="inline-flex items-center gap-1.5 rounded-full border border-[#dce7f0] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#0277bd] shadow-[rgba(2,136,209,0.08)_0_4px_12px]">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {{ t('hero.badge') }}
      </p>
      <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-[#101d2d] sm:text-[52px] sm:leading-[1.08]">
        {{ t('hero.titleA') }} <br class="hidden sm:block" />
        <span class="text-[#0288d1]">{{ t('hero.titleAccent') }}</span> {{ t('hero.titleB') }}
      </h1>
      <p class="mx-auto mt-4 max-w-xl text-base text-[#42566b] sm:text-lg">
        {{ t('hero.sub') }}
      </p>

      <form
        class="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row"
        @submit.prevent="onSubmit"
      >
        <input
          v-model="input"
          type="text"
          :placeholder="t('hero.placeholder')"
          :aria-label="t('hero.inputAria')"
          class="h-13 sm:flex-1 rounded-xl border border-[#dce7f0] bg-white px-4 text-[15px] shadow-[rgba(26,57,78,0.08)_0_8px_24px] outline-none transition-colors placeholder:text-[#8aa0b2] focus:border-[#0288d1]"
        />
        <button
          type="submit"
          :disabled="radar.searching.value || !input.trim()"
          class="h-13 shrink-0 cursor-pointer rounded-xl bg-[#0288d1] px-7 text-sm font-bold text-white shadow-[rgba(2,136,209,0.35)_0_8px_20px] transition-all hover:bg-[#0277bd] hover:shadow-[rgba(2,136,209,0.45)_0_10px_26px] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {{ t('hero.submit') }}
        </button>
      </form>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <button
          v-for="ex in examples"
          :key="ex"
          class="cursor-pointer rounded-full border border-[#dce7f0] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#42566b] transition-colors hover:border-[#0288d1] hover:text-[#0288d1]"
          @click="runExample(ex)"
        >
          {{ ex }}
        </button>
      </div>
    </div>
  </section>
  <main class="mx-auto max-w-[1200px] px-6 pb-16">

    <div v-if="radar.searching.value" class="mx-auto mt-12 max-w-3xl space-y-3">
      <div class="h-5 w-48 animate-pulse rounded-md bg-[#e8f1f7]" />
      <div class="grid gap-4 sm:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded-2xl bg-[#e8f1f7]/70" />
      </div>
      <p class="text-center text-sm text-[#5b7186]">{{ t('search.loading') }}</p>
    </div>

    <p v-if="searchErrorText" role="alert" class="mx-auto mt-12 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
      {{ searchErrorText }}
    </p>

    <template v-if="hasResult">
      <section class="mt-0 pt-6">
        <p class="text-xs font-semibold text-[#5b7186]">
          {{ t('results.for') }} <span class="font-bold text-[#101d2d]">“{{ radar.submittedQuery.value }}”</span>
        </p>
        <div class="mt-2 flex items-end gap-3">
          <p class="tnum bg-gradient-to-r to-[#101d2d] from-[#0288d1] bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            {{ radar.matchingTotal.value === null ? '—' : formatInt(radar.matchingTotal.value, tag) }}
          </p>
          <p class="pb-2 text-sm font-medium text-[#5b7186]">{{ t('results.matchingA') }}<br />{{ t('results.matchingB') }}</p>
        </div>
      </section>

      <section class="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard :label="t('metrics.newDetected')" :loading="radar.trendLoading.value" :failed="radar.trendError.value">
          <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ radar.currentPeriod.value === null ? '—' : formatInt(radar.currentPeriod.value, tag) }}</span>
          <span class="text-sm text-[#8aa0b2]">{{ t('metrics.lastPeriod') }}</span>
          <template #sub>
            {{ t('metrics.previous') }} {{ radar.previousPeriod.value === null ? '—' : formatInt(radar.previousPeriod.value, tag) }} ·
            {{ t('metrics.discovery') }} <DeltaPill :value="radar.trendChange.value" />
          </template>
        </MetricCard>

        <MetricCard :label="t('metrics.dr')" :loading="radar.drLoading.value" :failed="radar.drError.value">
          <div class="w-full space-y-1.5 pt-1">
            <div v-for="b in radar.drBuckets.value" :key="b.label" class="flex items-center gap-2 text-[13px]">
              <span class="tnum w-12 shrink-0 text-[#8aa0b2]">{{ b.label }}</span>
              <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e8f1f7]">
                <span class="block h-full rounded-full bg-gradient-to-r from-[#0288d1] to-[#4fc3f7]" :style="{ width: drBarPct(b.total) + '%' }" />
              </span>
              <span class="tnum w-8 shrink-0 text-right font-bold text-[#101d2d]">{{ b.total === null ? '—' : formatInt(b.total, tag) }}</span>
            </div>
            <p class="pt-1 text-[13px] text-[#5b7186]">
              {{ t('metrics.unknown') }} <span class="tnum font-bold text-[#101d2d]">{{ radar.drUnknown.value === null ? '—' : formatInt(radar.drUnknown.value, tag) }}</span>
            </p>
          </div>
        </MetricCard>

        <MetricCard :label="t('metrics.aiBuilt')" :loading="radar.aiBuiltLoading.value" :failed="radar.aiBuiltError.value">
          <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ formatPct(radar.aiBuiltPct.value) }}</span>
          <span class="tnum text-sm text-[#8aa0b2]">{{ radar.aiBuiltTotal.value === null ? '—' : formatInt(radar.aiBuiltTotal.value, tag) }} / {{ radar.matchingTotal.value === null ? '—' : formatInt(radar.matchingTotal.value, tag) }}</span>
          <template #sub>
            <span class="block space-y-1 pt-1">
              <span v-for="s in radar.aiBuiltBySource.value" :key="s.source" class="flex items-center justify-between gap-4">
                <span>{{ s.source }}</span>
                <span class="tnum font-bold text-[#101d2d]">{{ s.total === null ? '—' : formatInt(s.total, tag) }}</span>
              </span>
            </span>
          </template>
        </MetricCard>
      </section>

      <section class="mt-14">
        <div class="flex items-baseline justify-between">
          <h2 class="text-xl font-extrabold tracking-tight text-[#101d2d]">{{ t('products.title') }}</h2>
          <p class="text-xs font-medium text-[#5b7186]">{{ t('products.top8') }}</p>
        </div>
        <p v-if="emptyResult" class="mt-3 rounded-2xl border border-dashed border-[#c5d8e6] bg-white px-5 py-8 text-center text-sm font-medium text-[#5b7186]">
          {{ t('products.empty') }}
        </p>
        <div v-else class="mt-5 flex flex-col sm:grid gap-4 sm:grid-cols-2">
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
import { useLocale } from '../composables/useLocale'
import { formatInt } from '../utils/locale'
import { useNicheRadar } from '../composables/useNicheRadar'
import MarketHeatmap from '../components/MarketHeatmap.vue'
import MarketPulse from '../components/MarketPulse.vue'
import MetricCard from '../components/MetricCard.vue'
import DeltaPill from '../components/DeltaPill.vue'
import ProductCard from '../components/ProductCard.vue'

const radar = useNicheRadar()
const { t, tag } = useLocale()
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
const searchErrorText = computed(() => radar.searchError.value ? t(radar.searchError.value) : null)

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

<style scoped>
.h-13 {
  height: 3.25rem;
}
</style>
