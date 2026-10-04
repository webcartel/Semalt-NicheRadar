# AI Development Worklog

Decisions only, no prompt history.

## Scaffold

### AI-generated

Nuxt 4 skeleton, `services/freeserp.ts` API layer, types, composables
stubs, `utils/`, `scripts/freeserp-probe.mjs`.

### Manually changed

- Added root `tsconfig.json` extending `./.nuxt/tsconfig.json` (required for `nuxt typecheck`).
- Pinned `vue`, `vue-router@^5`, `vue-tsc@^3` as direct deps so `nuxt typecheck` resolves `vue-router/volar` plugin.
- Endpoint fixed to `https://freeserp.ai/api.php` (freeserp.com was wrong, 403s).
  MCP probe 2026-10-03 verified SPEC §24: encoded multi-word `q`, `ai`+`ai_startups`
  compat, date bounds, category combos, DR buckets — see `docs/API-NOTES.md`.

### Why

Typecheck failed without root tsconfig and without direct vue-router v5.
Base URL left unverified until a browser-side probe succeeds — see `docs/API-NOTES.md`.

## Heatmap decision B

### AI-generated

7d/prev-7d discovery per niche, SPEC-literal.

### Manually changed

Heatmap shows all-time niche size + AI-built share instead.

### Why

Category-sliced recent windows return ~0: AI enrichment lags discovery by
~7 weeks (Aug 01–15 backfill holds ~95% of categorized sites). 7d dynamics
per niche is currently unmeasurable — zeros, not a bug. Verified live:
`ai=1` composes with `ai_categories`. 7d code path can return when
enrichment catches up.

## Mobile heatmap cards

### Manually changed

`MarketHeatmap` renders stacked cards below `sm` (no table squeeze, no
horizontal scroll); table kept for `sm+` with `whitespace-nowrap` numerics.

### Why

Long niche names + fixed paddings + inline bar overlapped on 375px.
Per UX guidance: card layout instead of squeezed table.

## i18n EN/UK (custom subsystem)

### Manually changed

No `@nuxtjs/i18n` — `data/i18n/en.ts` + `uk.ts` (`uk: Record<I18nKey, string>`,
typecheck enforces completeness), `composables/useLocale.ts` (browser detect,
`localStorage`, `useHead` lang/title/meta sync), header EN | UA switcher.
API data, categories in queries, and example queries stay English.
Numbers/dates locale-formatted (`uk-UA`/`en-US`).

### Why

~50 static strings, state-only (no URL prefix), no-backend rule — a full
i18n module is overkill. Numbers and labels are separate elements, so no
pluralization is needed (UK labels use number-invariant phrasing).

## Footer slim + /about

### Manually changed

Footer collapsed to one line (tagline + link); full disclaimer moved to
static `pages/about.vue` (4 blocks, both languages). `footer.disclaimer`
key removed from dictionaries.

### Why

Footer wall-of-text hurt readability; the 4 data-honesty points (index ≠
market DB, `went_live` ≠ launch, enrichment/DR gaps, no verdicts) must stay
reachable per product rules, just not always visible.
