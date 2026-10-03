<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900">
            <span class="h-2 w-2 rounded-full bg-white" />
          </span>
          <span class="text-sm font-bold tracking-tight">NicheRadar</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span class="hidden rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-500 sm:inline">
            Data: FreeSerp Main
          </span>
          <span class="h-2 w-2 rounded-full bg-emerald-500" title="API status: operational" />
        </div>
      </div>
    </header>

    <NuxtPage />

    <footer class="border-t border-zinc-200/80 bg-white">
      <div class="mx-auto max-w-[1200px] px-6 py-8">
        <p class="max-w-3xl text-xs leading-relaxed text-zinc-400">
          Data: FreeSerp Main site index — a discovery index, not a complete market database.
          `went_live` is when FreeSerp first confirmed the site reachable, not an official
          launch date. Fresh records may have incomplete AI enrichment; DR can be
          unavailable for new domains. NicheRadar shows data and transparent calculations —
          conclusions are yours.
        </p>
        <p class="mt-3 text-xs text-zinc-400">NicheRadar · built on open FreeSerp discovery data</p>
      </div>
    </footer>
  </div>
</template>
