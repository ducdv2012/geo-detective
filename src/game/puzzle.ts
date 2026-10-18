import type { CaseRound, Clue, ClueKind, Country } from '../types'

export type RandomSource = () => number

export function seededRandom(seed: number): RandomSource {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function hemisphereFor(country: Country) {
  const latitude = country.capitalCoordinates?.latitude ?? 0
  const longitude = country.capitalCoordinates?.longitude ?? 0
  return `${latitude >= 0 ? 'north' : 'south'}-${longitude >= 0 ? 'east' : 'west'}`
}

function createClue(target: Country, kind: ClueKind): Clue {
  switch (kind) {
    case 'regionLanguage': return { kind, params: { region: target.region, language: target.languages[0] } }
    case 'currency': return { kind, params: { code: target.currencies[0].code, name: target.currencies[0].name } }
    case 'currencySymbol': return { kind, params: { symbol: target.currencies[0].symbol ?? target.currencies[0].code } }
    case 'borders': return { kind, params: { count: target.borders.length } }
    case 'subregion': return { kind, params: { subregion: target.subregion } }
    case 'timezone': return { kind, params: { timezone: target.timezones[0] ?? 'UTC' } }
    case 'hemisphere': return { kind, params: { hemisphere: hemisphereFor(target) } }
    case 'capitalPattern': return {
      kind,
      params: { initial: target.capital.charAt(0).toUpperCase(), length: target.capital.replace(/[^\p{L}]/gu, '').length },
    }
    case 'languageCount': return { kind, params: { count: target.languages.length } }
  }
}

function createClues(target: Country, clueKinds: ClueKind[]): Clue[] {
  return clueKinds.map((kind) => createClue(target, kind))
}

export function matchesClues(country: Country, clues: Clue[]): boolean {
  return clues.every((clue) => {
    if (clue.kind === 'regionLanguage') {
      return country.region === clue.params.region && country.languages.includes(String(clue.params.language))
    }
    if (clue.kind === 'currency') return country.currencies.some((currency) => currency.code === clue.params.code)
    if (clue.kind === 'currencySymbol') {
      return country.currencies.some((currency) => (currency.symbol ?? currency.code) === clue.params.symbol)
    }
    if (clue.kind === 'borders') return country.borders.length === Number(clue.params.count)
    if (clue.kind === 'subregion') return country.subregion === clue.params.subregion
    if (clue.kind === 'timezone') return country.timezones.includes(String(clue.params.timezone))
    if (clue.kind === 'hemisphere') return hemisphereFor(country) === clue.params.hemisphere
    if (clue.kind === 'capitalPattern') {
      return country.capital.charAt(0).toUpperCase() === clue.params.initial
        && country.capital.replace(/[^\p{L}]/gu, '').length === Number(clue.params.length)
    }
    return country.languages.length === Number(clue.params.count)
  })
}

export function generateUniquePuzzle(
  countries: Country[],
  day: number,
  random: RandomSource = Math.random,
  excludedCodes: string[] = [],
  clueKinds: ClueKind[] = ['regionLanguage', 'currency', 'borders'],
  optionCount = 8,
): CaseRound {
  const playable = countries.filter((country) =>
    country.languages.length > 0 && country.currencies.length > 0 && !excludedCodes.includes(country.code),
  )
  if (playable.length < optionCount) throw new Error(`At least ${optionCount} playable countries are required`)

  for (let attempt = 0; attempt < 400; attempt += 1) {
    const target = playable[Math.floor(random() * playable.length)]
    const clues = createClues(target, clueKinds)
    const distractors = shuffle(playable.filter((country) => country.code !== target.code), random).slice(0, optionCount - 1)
    const options = shuffle([target, ...distractors], random)
    if (options.filter((country) => matchesClues(country, clues)).length === 1) {
      return { day, target, options, clues, weather: null }
    }
  }

  const target = playable[0]
  const clues = createClues(target, clueKinds)
  const safeDistractors = playable.filter((country) => country.code !== target.code && !matchesClues(country, clues))
  if (safeDistractors.length < optionCount - 1) throw new Error('Unable to create a unique puzzle from the country pool')
  return { day, target, options: shuffle([target, ...safeDistractors.slice(0, optionCount - 1)], random), clues, weather: null }
}
