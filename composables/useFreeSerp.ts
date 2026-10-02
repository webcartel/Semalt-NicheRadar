// Thin wrappers over services/freeserp.ts for Vue components.

export function useFreeSerp() {
  // Keep request concurrency <= 3 via a small pool (SPEC §21).
  // Keep GET responses in sessionStorage for 5 min (SPEC §20).
  // TODO: implement after API probe.
  throw new Error('useFreeSerp not implemented yet — see SPEC §22')
}
