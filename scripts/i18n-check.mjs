// Usage: node scripts/i18n-check.mjs
import { readFileSync } from 'node:fs'

const keysOf = (p) => {
  const src = readFileSync(p, 'utf8')
  return [...src.matchAll(/^\s*'([^']+)'\s*:/gm)].map((m) => m[1])
}
const en = keysOf('data/i18n/en.ts')
const uk = keysOf('data/i18n/uk.ts')
const missing = en.filter((k) => !uk.includes(k))
const extra = uk.filter((k) => !en.includes(k))
const dupes = (a) => a.filter((k, i) => a.indexOf(k) !== i)
let ok = true
for (const k of missing) { console.error(`missing in uk.ts: ${k}`); ok = false }
for (const k of extra) { console.error(`extra in uk.ts: ${k}`); ok = false }
for (const k of dupes(en)) { console.error(`duplicate in en.ts: ${k}`); ok = false }
for (const k of dupes(uk)) { console.error(`duplicate in uk.ts: ${k}`); ok = false }
if (!ok) process.exit(1)
console.log(`i18n parity OK: ${en.length} keys`)
