import { fallbackCountries } from '../data/fallbackCountries'
import type { Country } from '../types'

export const COUNTRIES_CACHE_KEY = 'geo-detective:countries:v1'
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca3,capital,region,subregion,languages,currencies,borders,timezones,capitalInfo,translations,flag'

interface RawCountry {
  cca3?: string
  name?: { common?: string }
  translations?: { vie?: { common?: string } }
  region?: string
  subregion?: string
  capital?: string[]
  languages?: Record<string, string>
  currencies?: Record<string, { name?: string; symbol?: string }>
  borders?: string[]
  timezones?: string[]
  capitalInfo?: { latlng?: number[] }
  flag?: string
}

export function normalizeCountries(raw: RawCountry[]): Country[] {
  return raw.flatMap((item): Country[] => {
    const code = item.cca3
    const englishName = item.name?.common
    const capital = item.capital?.[0]
    const languages = Object.values(item.languages ?? {}).filter(Boolean)
    const currencies = Object.entries(item.currencies ?? {}).map(([currencyCode, value]) => ({
      code: currencyCode,
      name: value.name ?? currencyCode,
      symbol: value.symbol,
    }))

    if (!code || !englishName || !capital || !item.region || languages.length === 0 || currencies.length === 0) {
      return []
    }

    const coords = item.capitalInfo?.latlng
    return [{
      code,
      name: { en: englishName, vi: item.translations?.vie?.common ?? englishName },
      region: item.region,
      subregion: item.subregion ?? item.region,
      capital,
      languages,
      currencies,
      borders: item.borders ?? [],
      timezones: item.timezones ?? [],
      capitalCoordinates: coords?.length === 2
        ? { latitude: coords[0], longitude: coords[1] }
        : null,
      flag: item.flag ?? '🏳️',
    }]
  })
}

interface CacheEntry {
  savedAt: number
  countries: Country[]
}

export function readCountryCache(storage: Pick<Storage, 'getItem'>, now = Date.now()): Country[] | null {
  try {
    const raw = storage.getItem(COUNTRIES_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry
    if (!Array.isArray(parsed.countries) || now - parsed.savedAt >= CACHE_TTL_MS) return null
    return parsed.countries
  } catch {
    return null
  }
}

export function writeCountryCache(storage: Pick<Storage, 'setItem'>, countries: Country[], now = Date.now()) {
  try {
    storage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify({ savedAt: now, countries }))
  } catch {
    // Storage may be unavailable in privacy mode. The in-memory data still works.
  }
}

export async function fetchCountries(fetcher: typeof fetch = fetch): Promise<Country[]> {
  const response = await fetcher(COUNTRIES_URL)
  if (!response.ok) throw new Error(`Countries API returned ${response.status}`)
  const countries = normalizeCountries(await response.json() as RawCountry[])
  if (countries.length < 8) throw new Error('Countries API returned too few playable countries')
  return countries
}

export async function loadCountries(options: {
  storage?: Storage
  fetcher?: typeof fetch
  now?: number
} = {}): Promise<{ countries: Country[]; source: 'cache' | 'network' | 'fallback' }> {
  const storage = options.storage ?? (typeof localStorage === 'undefined' ? undefined : localStorage)
  const now = options.now ?? Date.now()
  const cached = storage ? readCountryCache(storage, now) : null
  if (cached && cached.length >= 8) return { countries: cached, source: 'cache' }

  try {
    const countries = await fetchCountries(options.fetcher)
    if (storage) writeCountryCache(storage, countries, now)
    return { countries, source: 'network' }
  } catch {
    return { countries: fallbackCountries, source: 'fallback' }
  }
}
