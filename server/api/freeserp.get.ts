// Same-origin proxy for FreeSerp (SPEC §5 workaround).
// The API answers browser fetch with a duplicated
// `Access-Control-Allow-Origin: *, *` header, which browsers reject.
// Server-side fetch is unaffected, so the app talks to this route
// (same origin, no CORS) and the route forwards to FreeSerp.
// No DB, no auth, no state — pure pass-through, SPEC non-goals intact.

const UPSTREAM = 'https://freeserp.ai/api.php'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const usp = new URLSearchParams({ index: 'sites' })
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v))
  }
  const res = await fetch(`${UPSTREAM}?${usp.toString()}`)
  if (!res.ok) {
    throw createError({ statusCode: 502, message: `FreeSerp unavailable (HTTP ${res.status})` })
  }
  return res.json()
})
