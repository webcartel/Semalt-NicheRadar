<template>
  <span
    class="tnum inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
    :class="tone"
  >
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number | null }>()

const text = computed(() => {
  if (props.value === null) return '—'
  return `${props.value >= 0 ? '+' : ''}${props.value.toFixed(0)}%`
})

const tone = computed(() => {
  if (props.value === null) return 'bg-zinc-100 text-zinc-500'
  if (props.value > 0) return 'bg-emerald-50 text-emerald-700'
  if (props.value < 0) return 'bg-rose-50 text-rose-700'
  return 'bg-zinc-100 text-zinc-500'
})
</script>
