# FreeSerp API Notes

Facts only. No assumptions. Endpoint: `https://freeserp.ai/api.php` (NOT freeserp.com).

## 2026-10-03 — MCP probe (SPEC §24), all tests pass

- Test 1, multi-word `q`: `q=resume&ai_startups=1` → total 1713;
  `q=AI%20meeting%20notes&ai_startups=1` → total 527, top hit colibri.ai
  (dr 26, `ai_categories` ["AI Agents & Autonomous","Notes & Meetings",
  "Transcription & Speech-to-Text"]). Spaces in `q` MUST be URL-encoded
  (`%20`/`+`) — raw spaces return `{"ok":false,"error":"bad_response"}`.
  `URLSearchParams` in app code encodes automatically.
- Test 2, `ai=1` + `ai_startups=1` COMPATIBLE: total 76 of 527.
  Response echoes `filters: {real_site:"1", ai_built_only:true, ai_startups:true}`.
  AI-built share formula from SPEC §13 works.
- Test 3, date bounds: `from_date=2026-08-01&to_date=2026-09-01` → total 512,
  top hit went_live 2026-08-07 (inside window). Inverted range
  (from > to) → `total: 0`, no error. `from_date/to_date` filter `went_live`.
- Test 4, combo `q` + `ai_startups` + `ai_categories=Notes & Meetings` → total 13.
  Category-only + dates (heatmap-style):
  `ai_startups=1&ai_categories=Notes & Meetings&from_date=2026-09-01&to_date=2026-10-02`
  → total 0. Fresh-window lag is real — SPEC §11 offset window stays relevant.
- Test 5, DR buckets: 0–4 → 210; 5–9 → 38. Buckets compose with `q`+`ai_startups`.
- Latency (server-side): `took_ms` 5–6, `engine_ms` 3–4. Browser latency will be
  higher — measure again from the app before tuning concurrency.
- Defaults echoed by API: `sort=relevance`, `order=desc`, `real_site=1`
  (parked/empty filtered unless `all=1`).
- Nullable fields observed: `ai_source: null` (jobscan.co), `webserver: null`
  (colibri.ai). Handle nulls — no invented values.
- `stats`: `ai_startups.total` 33570, `ai_startups.today` 0 (lag!),
  `new.today` 37869, `new.last_7d` 233876. `by_day` is GLOBAL new-site counts,
  not AI-filtered — never chart it as AI activity (SPEC §17).
- Real `top_ai_categories` (for `data/aiCategories.ts`): "Other AI",
  "AI Agents & Autonomous", "AI Automation & Workflows", "Code & Dev Tools",
  "Education & Tutoring", "Data & Analytics", "Marketing & Ads", "SEO & Content",
  "AI Infrastructure & API", "AI Chatbot & Assistant", "Productivity",
  "Customer Support", "AI Search & Answers", "Image Generation", "Video Generation", …
- Real `top_ai_source`: not_ai, wordpress, ai_likely, wix, nextjs, shopify,
  elementor, lovable, base44, framer, … (plus `gen:*` plugin signatures).
- Full field catalog: see MCP `freeserp_list_endpoints` / `freeserp_help`
  (sortable: relevance, dr, went_live, first_seen, …; size 1–100).

## 2026-10-02 — dead end (superseded)

- `freeserp.com` is the WRONG host: `/api.php` → HTTP 403 challenge (Node and
  browser), `api.freeserp.com` → `{"error":"Not found"}` on `/`, `/api`, `/api.php`.
  Correct host is `freeserp.ai`. Kept here so nobody retries it.
