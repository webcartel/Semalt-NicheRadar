<template>
  <article class="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
    <div class="flex items-start gap-3">
      <img
        v-if="showIcon"
        :src="`https://www.google.com/s2/favicons?domain=${product.domain}&sz=64`"
        :alt="`${product.domain} icon`"
        loading="lazy"
        width="28"
        height="28"
        class="mt-0.5 h-7 w-7 shrink-0 rounded-md border border-zinc-100"
        @error="showIcon = false"
      />
      <div class="min-w-0">
        <p class="truncate text-[15px] font-semibold tracking-tight">{{ product.title }}</p>
        <p class="text-xs text-zinc-400">{{ product.domain }}</p>
      </div>
    </div>
    <p v-if="product.ai_summary" class="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
      {{ product.ai_summary }}
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
      <span
        v-for="c in categories"
        :key="c"
        class="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600"
      >
        {{ c }}
      </span>
      <span v-if="product.dr != null" class="tnum rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
        DR {{ product.dr }}
      </span>
      <span v-if="product.went_live" class="px-1 text-zinc-400">
        Live since {{ formatMonth(product.went_live) }}
      </span>
      <span v-if="product.ai_source" class="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
        AI-built: {{ product.ai_source }}
      </span>
    </div>
    <a
      :href="product.url"
      target="_blank"
      rel="noopener"
      class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
    >
      Open site
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 9 9 3M9 3H4.5M9 3v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FreeSerpSiteResult } from '../types/freeserp'

const props = defineProps<{ product: FreeSerpSiteResult }>()
const showIcon = ref(true)

const categories = computed(() => {
  const v = props.product.ai_categories
  if (!v) return []
  const arr = Array.isArray(v) ? v : [v]
  return arr.slice(0, 3)
})

function formatMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>
