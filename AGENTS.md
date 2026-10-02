# Project Instructions

## Product

NicheRadar is a small AI niche discovery dashboard built on top of
FreeSerp Main (`index=sites`).

## Rules

- Do not invent FreeSerp fields.
- Inspect API responses before implementing assumptions.
- Use `ai_startups=1` for Idea Check queries.
- Prefer exact `total` values from `index=sites`.
- Do not describe `went_live` as an official launch date.
- Do not generate subjective market verdicts.
- Do not add authentication, database or backend.
- Keep API logic outside Vue components.
- Keep request concurrency at 3.
- Cache repeated GET requests in sessionStorage.
- Handle null DR explicitly.
- Do not use `index=web` in the MVP.
- Run typecheck and build after meaningful changes.
- Review the final UI manually.

## Commands

```bash
npm install        # then npx nuxi prepare (generates .nuxt/tsconfig.json)
npm run dev        # Nuxt dev server
npm run typecheck  # nuxt typecheck — must pass
npm run build      # production build — must pass
npm run probe      # node scripts/freeserp-probe.mjs — run BEFORE UI work (SPEC §24)
```

## Verified setup quirks

- Root `tsconfig.json` (`{ "extends": "./.nuxt/tsconfig.json" }`) is required;
  `nuxt typecheck` fails without it.
- `nuxt typecheck` needs direct deps `vue`, `vue-router@^5`, `vue-tsc@^3`;
  without them the `vue-router/volar` plugin fails to resolve.
- FreeSerp endpoint is `https://freeserp.ai/api.php` (NOT freeserp.com —
  that host 403s; see `docs/API-NOTES.md`). Base URL lives in
  `services/freeserp.ts` (`FREESERP_BASE_URL`, `FREESERP_BASE_URL` env in probe).
- Multi-word `q` MUST be URL-encoded (`URLSearchParams` does it); raw spaces
  return `{"ok":false,"error":"bad_response"}`.
- API defaults: `sort=relevance`, `order=desc`, `real_site=1`.
  `ai=1` composes with `ai_startups=1`; `from_date/to_date` filter `went_live`;
  inverted date range returns `total: 0`, not an error.
- Browser `fetch` to the upstream is blocked: it answers with a duplicated
  `Access-Control-Allow-Origin: *, *` header. The app calls same-origin
  `buildProxyUrl()` → Nitro `server/api/freeserp.get.ts` (pure pass-through,
  no DB/auth). Direct `buildSitesUrl()` is for server/scripts only.

## Architecture

- All FreeSerp URL building + fetching: `services/freeserp.ts`
  (`searchSites`, `getStats`, `countByDateRange`, `countByDrRange`,
  `countByCategory`, `countAiBuilt`). Components must not build URLs.
- Types: `types/freeserp.ts` (extend only from real responses).
- State/cache: `composables/useFreeSerp.ts`, `useSessionCache.ts`
  (key `freeserp:<normalized-url>`, TTL 5 min), `useNicheRadar.ts`.
- Pure helpers: `utils/normalizeQuery.ts`, `utils/dateRanges.ts`
  (offset window T-33..T-3 / T-63..T-34), `utils/metrics.ts`
  (`discoveryChange` returns null when previous === 0).
- Category snapshot: `data/aiCategories.ts` — fill only from `help=1`, never invent.
- Pages: `pages/index.vue`, `pages/niche/[category].vue`
  (may fold into query state per SPEC §6).

## Wording (do not rephrase)

- `Live since <Mon YYYY>` / `First detected <Mon YYYY>` — never `Launched`.
- `New-site discovery +X%` / `Newly detected products +X%` — never `Market growth`.
- `73 matching AI products` — never `73 competitors`.
- `Change: —` when previous period is 0; never infinite %.
- DR buckets via `size=1` + `dr_min/dr_max` totals; `unknown = matching_total - sum(buckets)`.
