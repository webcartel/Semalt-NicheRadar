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
