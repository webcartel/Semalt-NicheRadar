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

    <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-[#101d2d] sm:text-4xl">{{ t('about.title') }}</h1>

    <div class="card-soft mt-8 space-y-4 p-5 text-sm leading-relaxed text-[#42566b] sm:p-6 sm:text-[15px]">
      <p>{{ t('about.p1') }}</p>
      <p>{{ t('about.p2') }}</p>
      <p>{{ t('about.p3') }}</p>
      <p>{{ t('about.p4') }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const { t } = useLocale()
</script>
