<script setup lang="ts">
import { useLocale } from './composables/useLocale'

const { locale, t, setLocale, initLocale } = useLocale()

initLocale()

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: t('meta.title'),
  meta: [{ name: 'description', content: t('meta.description') }],
}))
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <header class="sticky top-0 z-10 border-b border-[#dce7f0]/80 bg-white/85 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0288d1]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="white" stroke-width="1.6" />
              <circle cx="7" cy="7" r="2" fill="white" />
              <path d="M7 1.5v2M12.5 7h-2M7 12.5v-2M1.5 7h2" stroke="white" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          <span class="text-sm font-extrabold tracking-tight text-[#101d2d]">NicheRadar</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span class="hidden rounded-full border border-[#dce7f0] bg-[#e8f1f7]/60 px-3 py-1 text-[11px] font-semibold text-[#0277bd] sm:inline">
            {{ t('header.badge') }}
          </span>
          <span class="h-2 w-2 rounded-full bg-emerald-500" title="API status: operational" />
          <div role="group" :aria-label="t('header.langLabel')" class="flex items-center overflow-hidden rounded-full border border-[#dce7f0] text-[11px] font-bold">
            <button
              v-for="l in (['en', 'uk'] as const)"
              :key="l"
              :aria-pressed="locale === l"
              class="cursor-pointer px-2.5 py-1 uppercase transition-colors"
              :class="locale === l ? 'bg-[#0288d1] text-white' : 'text-[#0277bd] hover:bg-[#e8f1f7]'"
              @click="setLocale(l)"
            >
              {{ l === 'uk' ? 'UA' : 'EN' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <NuxtPage />

    <footer class="border-t border-[#dce7f0]/80 bg-white">
      <div class="mx-auto max-w-[1200px] px-6 py-8">
        <p class="text-xs font-medium text-[#5b7186]">
          {{ t('footer.tagline') }}
          <span aria-hidden="true"> · </span>
          <NuxtLink to="/about" class="font-bold text-[#0288d1] transition-colors hover:text-[#0277bd]">{{ t('footer.about') }}</NuxtLink>
        </p>
      </div>
    </footer>
  </div>
</template>
