export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Offset window (SPEC §11): recent T-33..T-3, previous T-63..T-34. */
export function offsetWindows(now = new Date()) {
  const day = 24 * 3600 * 1000
  const t = now.getTime()
  return {
    current: { from: toISODate(new Date(t - 33 * day)), to: toISODate(new Date(t - 3 * day)) },
    previous: { from: toISODate(new Date(t - 63 * day)), to: toISODate(new Date(t - 34 * day)) },
  }
}

export function last30Windows(now = new Date()) {
  const day = 24 * 3600 * 1000
  const t = now.getTime()
  return {
    current: { from: toISODate(new Date(t - 30 * day)), to: toISODate(new Date(t)) },
    previous: { from: toISODate(new Date(t - 60 * day)), to: toISODate(new Date(t - 30 * day)) },
  }
}
