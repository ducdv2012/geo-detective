export type Locale = 'vi' | 'en'

export interface Country {
  code: string
  name: { en: string; vi: string }
  region: string
  subregion: string
  capital: string
  languages: string[]
  currencies: Array<{ code: string; name: string; symbol?: string }>
  borders: string[]
  timezones: string[]
  capitalCoordinates: { latitude: number; longitude: number } | null
  flag: string
}

export interface WeatherSnapshot {
  available: boolean
  temperature?: number
  weatherCode?: number
  precipitation?: number
}

export type ClueKind =
  | 'regionLanguage'
  | 'currency'
  | 'currencySymbol'
  | 'borders'
  | 'subregion'
  | 'timezone'
  | 'hemisphere'
  | 'capitalPattern'
  | 'languageCount'

export interface Clue {
  kind: ClueKind
  params: Record<string, string | number>
}

export interface CaseRound {
  day: number
  target: Country
  options: Country[]
  clues: Clue[]
  weather: WeatherSnapshot | null
  submittedGuess?: string
}

export type DossierDifficulty = 'rookie' | 'field' | 'senior' | 'master' | 'legend'
export type DetectiveRankId = 'trainee' | 'investigator' | 'fieldDetective' | 'seniorDetective' | 'masterDetective' | 'legendaryDetective'
export type BadgeId = 'eagleEye' | 'pureDeduction' | 'noFlag' | 'streakThree' | 'comeback' | 'continentSpecialist' | 'legendThreeClues'

export interface Dossier {
  id: string
  difficulty: DossierDifficulty
  title: Record<Locale, string>
  briefing: Record<Locale, string>
  origin: string
  optionCount: number
  clueKinds: ClueKind[]
  hideFlags: boolean
  hideCodes: boolean
}

export type GameStatus = 'briefing' | 'investigating' | 'won' | 'lost'

export interface GameState {
  status: GameStatus
  round: CaseRound | null
  lastWrongCountry: Country | null
  revealedClueCount: number
  pointsSpentThisAttempt: number
  isRecovery: boolean
}

export interface PlayerProgress {
  version: 4
  pointBalance: number
  highestUnlockedDossier: number
  bestScoresByDossier: Record<string, number>
  recoveryRequired: boolean
  recoveryDossierIndex: number
  reputation: number
  earnedBadges: BadgeId[]
  winStreak: number
  winsByRegion: Record<string, number>
  reputationDate: string
  reputationCasesToday: number
}

export interface ScoreResult {
  grossScore: number
  previousBest: number
  earnedPoints: number
  pointsSpent: number
  balance: number
  reputationEarned: number
  newReputation: number
  unlockedBadges: BadgeId[]
  rankAdvanced: boolean
}

export interface PenaltyResult {
  configuredPenalty: number
  deductedPoints: number
  balance: number
  recoveryTriggered: boolean
}

export interface RecoveryResult {
  reward: number
  balance: number
  reputationEarned: number
  newReputation: number
  unlockedBadges: BadgeId[]
  rankAdvanced: boolean
}
