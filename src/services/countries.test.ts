import { describe, expect, it, vi } from 'vitest'
import { CACHE_TTL_MS, COUNTRIES_CACHE_KEY, loadCountries, normalizeCountries, readCountryCache } from './countries'

describe('normalizeCountries', () => {
  it('normalizes multilingual, multi-currency country data', () => {
    const result = normalizeCountries([{
      cca3: 'TST', name: { common: 'Testland' }, translations: { vie: { common: 'Xứ Thử' } },
      region: 'Asia', subregion: 'Test Asia', capital: ['Alpha'], languages: { eng: 'English', vie: 'Vietnamese' },
      currencies: { AAA: { name: 'Alpha', symbol: 'A' }, BBB: { name: 'Beta' } }, borders: ['ONE'],
      timezones: ['UTC+01:00'], capitalInfo: { latlng: [1, 2] }, flag: '🧪',
    }])
    expect(result[0]).toMatchObject({ code: 'TST', name: { vi: 'Xứ Thử' }, languages: ['English', 'Vietnamese'] })
    expect(result[0].currencies).toHaveLength(2)
  })

  it('keeps playable countries without capital coordinates', () => {
    const result = normalizeCountries([{
      cca3: 'TST', name: { common: 'Testland' }, region: 'Europe', capital: ['Alpha'],
      languages: { eng: 'English' }, currencies: { TST: { name: 'Test coin' } },
    }])
    expect(result[0].capitalCoordinates).toBeNull()
  })
})

describe('country cache and fallback', () => {
  it('rejects an expired cache', () => {
    const storage = { getItem: () => JSON.stringify({ savedAt: 0, countries: new Array(8).fill({}) }) }
    expect(readCountryCache(storage, CACHE_TTL_MS)).toBeNull()
  })

  it('uses fallback data when the network fails', async () => {
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn() } as unknown as Storage
    const result = await loadCountries({ storage, fetcher: vi.fn().mockRejectedValue(new Error('offline')) })
    expect(result.source).toBe('fallback')
    expect(result.countries.length).toBeGreaterThanOrEqual(20)
    expect(storage.getItem).toHaveBeenCalledWith(COUNTRIES_CACHE_KEY)
  })
})
