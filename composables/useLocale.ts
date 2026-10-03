import { computed } from 'vue'
import { en, type I18nKey } from '../data/i18n/en'
import { uk } from '../data/i18n/uk'
import { detectInitialLocale, localeTag, type AppLocale } from '../utils/locale'

const STORAGE_KEY = 'nicheradar:locale'

const dicts: Record<AppLocale, Record<I18nKey, string>> = { en, uk }

export function useLocale() {
  const locale = useState<AppLocale>('locale', () => 'en')
  const tag = computed(() => localeTag(locale.value))

  function t(key: I18nKey): string {
    const hit = dicts[locale.value][key]
    if (hit !== undefined) return hit
    if (import.meta.dev) console.warn(`[i18n] missing key "${key}" for "${locale.value}", fell back to en`)
    return en[key]
  }

  function setLocale(next: AppLocale): void {
    locale.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // private mode / blocked storage: app keeps working in memory
    }
  }

  function initLocale(): void {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      stored = null
    }
    const nav = typeof navigator !== 'undefined' ? navigator.language : null
    locale.value = detectInitialLocale(stored, nav)
  }

  return { locale, tag, t, setLocale, initLocale }
}
