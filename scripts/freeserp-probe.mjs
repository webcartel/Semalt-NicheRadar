// FreeSerp API probe — SPEC §24. Run BEFORE building UI.
// Usage: npm run probe
// Findings go to docs/API-NOTES.md (facts only, no assumptions).

const BASE = process.env.FREESERP_BASE_URL ?? 'https://freeserp.ai/api.php'

async function get(params) {
  const usp = new URLSearchParams({ index: 'sites', ...params })
  const url = `${BASE}?${usp.toString()}`
  const t0 = Date.now()
  const res = await fetch(url)
  const ms = Date.now() - t0
  const body = await res.text()
  let parsed = null
  try {
    parsed = JSON.parse(body)
  } catch {}
  console.log(`\n### GET ${url}\n-> HTTP ${res.status} in ${ms}ms, ${body.length} chars`)
  if (parsed) {
    console.log(
      JSON.stringify(
        { ok: parsed.ok, index: parsed.index, total: parsed.total, count: parsed.count, first: parsed.results?.[0] ?? null, keys: parsed.results?.[0] ? Object.keys(parsed.results[0]) : [] },
        null,
        2,
      ).slice(0, 3000),
    )
  } else {
    console.log(body.slice(0, 1000))
  }
  return parsed
}

const q = 'AI meeting notes'

await get({ q, ai_startups: '1', size: '3' }) // Test 1: multi-word q
await get({ q, ai_startups: '1', ai: '1', size: '1' }) // Test 2: ai + ai_startups compat
await get({ q, ai_startups: '1', size: '1', from_date: '2026-08-01', to_date: '2026-09-01' }) // Test 3: date bounds
await get({ q, ai_startups: '1', size: '1', dr_min: '0', dr_max: '4' }) // Test 5: DR bucket
await get({ stats: '1' }) // Market Pulse fields
await get({ help: '1' }) // valid ai_categories / ai_source values
