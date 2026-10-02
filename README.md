# NicheRadar

## What

NicheRadar is a small AI niche discovery dashboard built on top of
FreeSerp Main (`index=sites`). Answer: "What is happening in this AI niche right now?"

## Why

Founders, indie hackers and PMs want a seconds-fast read on how many
similar AI products are being discovered and how active a niche is —
without subjective verdicts.

## Features

- Idea Check (matching AI products for a free-text niche)
- niche activity (current vs previous discovery window)
- DR distribution (bucketed `total` counts + unknown)
- AI-built signals (`ai=1` share + source breakdown)
- matching AI products (top relevance results)
- niche heatmap (per-category discovery)
- market pulse (`stats=1`)

## Tech

Nuxt 4 / TypeScript / Tailwind / FreeSerp API. No backend, no auth, no DB.
Keyless CORS-open `GET /api.php`, `native fetch`, `sessionStorage` cache.

## Run

```bash
npm install
npm run dev
```

Probe the API before building UI:

```bash
npm run probe
```

## Build

```bash
npm run typecheck
npm run build
```

## API limitations

- `went_live` ≠ official launch date (first confirmed availability in index).
- `first_seen` ≠ verified launch date.
- Fresh records can have incomplete AI enrichment (see SPEC §11 offset window).
- `dr` can be null — show `DR unavailable` explicitly.
- `q` is text search, not semantic search.
- `index=sites` is a discovery/site index, not a complete market database.
- `total` is exact for `index=sites`; do not compute population stats from top-100 relevance slices.

## Not implemented (MVP scope)

Auth, backend, database, accounts, billing, favorites, product
comparison, LLM recommendations, chat, scraping, admin, CMS, analytics,
`index=web` in the main flow.

## Future

Saved reports, shareable niche URLs, historical snapshots, alerts,
API/backend caching, richer niche comparisons.
