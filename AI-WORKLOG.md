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
