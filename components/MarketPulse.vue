<template>
  <section class="mt-4">
    <div class="flex items-baseline justify-between">
      <h2 class="text-xl font-extrabold tracking-tight text-[#101d2d]">Market Pulse</h2>
      <p class="text-xs font-medium text-[#5b7186]">FreeSerp index stats</p>
    </div>
    <div v-if="loading" class="mt-5 grid gap-4 sm:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-[#e8f1f7]/70" />
    </div>
    <p v-else-if="failed" class="mt-5 text-sm text-[#5b7186]">Some analytics could not be loaded.</p>
    <div v-else class="mt-5 grid gap-4 sm:grid-cols-3">
      <MetricCard label="AI startups detected today">
        <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ today ?? '—' }}</span>
      </MetricCard>
      <MetricCard label="AI startups total">
        <span class="tnum text-3xl font-extrabold text-[#101d2d]">{{ total ?? '—' }}</span>
      </MetricCard>
      <MetricCard label="Top AI niches">
        <ul class="space-y-1.5 pt-1 text-sm font-semibold text-[#101d2d]">
          <li v-for="(c, i) in topCategories" :key="c" class="flex items-center gap-2.5">
            <span class="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#0288d1] text-[11px] font-bold text-white">{{ i + 1 }}</span>
            {{ c }}
          </li>
        </ul>
      </MetricCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFreeSerp } from '../composables/useFreeSerp'
import MetricCard from './MetricCard.vue'

// Uses only fields the live stats response actually provides (SPEC §17):
// ai_startups.today, ai_startups.total, top_ai_categories.
// NOTE: the response has NO ai_startups.last_7d, so "last 7 days" for AI
// startups is not shown — no fabricated values.

const loading = ref(true)
const failed = ref(false)
const today = ref<number | null>(null)
const total = ref<number | null>(null)
const topCategories = ref<string[]>([])

onMounted(async () => {
  try {
    const stats = await useFreeSerp().getStats() as unknown as {
      ai_startups?: { today?: number, total?: number }
      top_ai_categories?: Array<{ key?: string }>
    }
    today.value = stats.ai_startups?.today ?? null
    total.value = stats.ai_startups?.total ?? null
    topCategories.value = (stats.top_ai_categories ?? [])
      .map(c => c.key)
      .filter((k): k is string => typeof k === 'string')
      .slice(0, 3)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>
