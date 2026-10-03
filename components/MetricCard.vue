<template>
  <div class="card-soft p-5">
    <p class="text-[11px] font-bold uppercase tracking-widest text-[#5b7186]">{{ label }}</p>
    <div v-if="loading" class="mt-3 space-y-2">
      <div class="h-8 w-24 animate-pulse rounded-md bg-[#e8f1f7]" />
      <div class="h-4 w-32 animate-pulse rounded-md bg-[#e8f1f7]" />
    </div>
    <p v-else-if="failed" class="mt-3 text-sm text-[#5b7186]">Some analytics could not be loaded.</p>
    <div v-else class="mt-2">
      <div class="flex items-baseline gap-2">
        <slot />
      </div>
      <div class="mt-1 text-[13px] text-[#5b7186]">
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
