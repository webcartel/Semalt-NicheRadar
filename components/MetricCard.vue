<template>
  <div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
    <p class="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{{ label }}</p>
    <div v-if="loading" class="mt-3 space-y-2">
      <div class="h-8 w-24 animate-pulse rounded-md bg-zinc-100" />
      <div class="h-4 w-32 animate-pulse rounded-md bg-zinc-100" />
    </div>
    <p v-else-if="failed" class="mt-3 text-sm text-zinc-400">Some analytics could not be loaded.</p>
    <div v-else class="mt-2">
      <div class="flex items-baseline gap-2">
        <slot />
      </div>
      <div class="mt-1 text-[13px] text-zinc-500">
        <slot name="sub" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  loading?: boolean
  failed?: boolean
}>()
</script>
