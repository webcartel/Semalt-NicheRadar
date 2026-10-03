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
            FreeSerp Main index
          </span>
          <span class="h-2 w-2 rounded-full bg-emerald-500" title="API status: operational" />
        </div>
      </div>
    </header>

    <NuxtPage />

    <footer class="border-t border-[#dce7f0]/80 bg-white">
      <div class="mx-auto max-w-[1200px] px-6 py-8">
        <p class="max-w-3xl text-xs leading-relaxed text-[#5b7186]">
          Data: FreeSerp Main site index — a discovery index, not a complete market database.
          `went_live` is when FreeSerp first confirmed the site reachable, not an official
          launch date. Fresh records may have incomplete AI enrichment; DR can be
          unavailable for new domains. NicheRadar shows data and transparent calculations —
          conclusions are yours.
        </p>
        <p class="mt-3 text-xs font-medium text-[#5b7186]">NicheRadar · built on open FreeSerp discovery data</p>
      </div>
    </footer>
  </div>
</template>
