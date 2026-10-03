export type AppLocale = 'en' | 'uk'

const STORAGE_VALUES: readonly string[] = ['en', 'uk']

export function detectInitialLocale(
  stored: string | null,
  navigatorLang: string | null,
): AppLocale {
  if (stored !== null && (STORAGE_VALUES as readonly string[]).includes(stored)) {
    return stored as AppLocale
  }
  if (navigatorLang !== null && navigatorLang.toLowerCase().startsWith('uk')) return 'uk'
  return 'en'
}

export function localeTag(locale: AppLocale): string {
  return locale === 'uk' ? 'uk-UA' : 'en-US'
}

export function formatInt(n: number, tag: string): string {
  return new Intl.NumberFormat(tag).format(n)
}

export function formatMonth(iso: string, tag: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(tag, { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
