// FreeSerp Main (`index=sites`) response shapes.
// Verify against live responses before extending — see docs/API-NOTES.md.
// Do not invent fields.

export interface FreeSerpSiteResult {
  domain: string
  url: string
  title: string
  ai_summary?: string | null
  category?: string | null
  ai_categories?: string[] | string | null
  ai_source?: string | null
  dr?: number | null
  went_live?: string | null
  first_seen?: string | null
  tld?: string | null
  real_site?: number | null
  http_status?: number | null
  webserver?: string | null
  ip?: string | null
  html_size?: number | null
  content_length?: number | null
  fetched_at?: string | null
}

export interface FreeSerpResponse {
  ok: boolean
  index: string
  query?: string
  total: number
  count: number
  from: number
  size: number
  results?: FreeSerpSiteResult[]
}
