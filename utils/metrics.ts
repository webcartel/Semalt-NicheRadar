/** ((current - previous) / previous) * 100, or null when previous === 0. */
export function discoveryChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function aiBuiltShare(aiBuiltTotal: number, matchingTotal: number): number | null {
  if (matchingTotal === 0) return null
  return (aiBuiltTotal / matchingTotal) * 100
}
