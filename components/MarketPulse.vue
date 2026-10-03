<template>
  <section class="mt-12">
    <h2 class="text-lg font-semibold">Market Pulse</h2>
    <p v-if="loading" class="mt-4 text-sm text-neutral-400">Loading...</p>
    <p v-else-if="failed" class="mt-4 text-sm text-neutral-400">Some analytics could not be loaded.</p>
    <div v-else class="mt-4 grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-neutral-200 p-4">
        <p class="text-xs uppercase tracking-wide text-neutral-400">AI startups detected today</p>
        <p class="mt-1 text-3xl font-semibold">{{ today ?? '—' }}</p>
      </div>
      <div class="rounded-xl border border-neutral-200 p-4">
        <p class="text-xs uppercase tracking-wide text-neutral-400">AI startups total</p>
        <p class="mt-1 text-3xl font-semibold">{{ total ?? '—' }}</p>
      </div>
      <div class="rounded-xl border border-neutral-200 p-4">
        <p class="text-xs uppercase tracking-wide text-neutral-400">Top AI niches</p>
        <ul class="mt-1 space-y-0.5 text-sm">
          <li v-for="c in topCategories" :key="c">{{ c }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFreeSerp } from '../composables/useFreeSerp'

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
