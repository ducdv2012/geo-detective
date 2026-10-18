import { describe, expect, it, vi } from 'vitest'
import { dossiers } from '../data/dossiers'
import type { PlayerProgress } from '../types'
import {
  applyCaseLoss,
  applyCaseWin,
  applyRecoveryWin,
  buyClue,
  calculateCaseScore,
  EXTRA_CLUE_COSTS,
  FAILURE_PENALTIES,
  loadProgress,
  OLDER_PROGRESS_KEY,
  PREVIOUS_PROGRESS_KEY,
  PROGRESS_KEY,
  RECOVERY_REWARD,
  saveProgress,
} from './progress'

const progress = (overrides: Partial<PlayerProgress> = {}): PlayerProgress => ({
  version: 4,
  pointBalance: 0,
  highestUnlockedDossier: 0,
  bestScoresByDossier: {},
  recoveryRequired: false,
  recoveryDossierIndex: 0,
  reputation: 0,
  earnedBadges: [],
  winStreak: 0,
  winsByRegion: {},
  reputationDate: '',
  reputationCasesToday: 0,
  ...overrides,
})

describe('scoring', () => {
  it('scores every day and difficulty with integer values', () => {
    expect([1, 2, 3].map((day) => calculateCaseScore('rookie', day))).toEqual([300, 200, 100])
    expect([1, 2, 3].map((day) => calculateCaseScore('field', day))).toEqual([375, 250, 125])
    expect([1, 2, 3].map((day) => calculateCaseScore('senior', day))).toEqual([450, 300, 150])
    expect([1, 2, 3].map((day) => calculateCaseScore('master', day))).toEqual([525, 350, 175])
    expect([1, 2, 3].map((day) => calculateCaseScore('legend', day))).toEqual([600, 400, 200])
  })

  it('awards only improvement over the previous best', () => {
    const first = applyCaseWin(progress(), dossiers[0], 0, 2, 0)
    expect(first.result.earnedPoints).toBe(200)
    expect(first.progress.pointBalance).toBe(200)

    const worse = applyCaseWin(first.progress, dossiers[0], 0, 3, 0)
    expect(worse.result.earnedPoints).toBe(0)
    expect(worse.progress.pointBalance).toBe(200)

    const improved = applyCaseWin(worse.progress, dossiers[0], 0, 1, 0)
    expect(improved.result.earnedPoints).toBe(100)
    expect(improved.progress.bestScoresByDossier['042']).toBe(300)
  })

  it('keeps awarded points when the player starts and completes a new dossier', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }

    const firstWin = applyCaseWin(progress(), dossiers[0], 0, 1, 0)
    saveProgress(storage, firstWin.progress)
    const carriedProgress = loadProgress(storage)
    const secondWin = applyCaseWin(carriedProgress, dossiers[1], 1, 2, 0)

    expect(firstWin.progress.pointBalance).toBe(300)
    expect(carriedProgress.pointBalance).toBe(300)
    expect(secondWin.result.earnedPoints).toBe(250)
    expect(secondWin.progress.pointBalance).toBe(550)
    expect(secondWin.progress.bestScoresByDossier).toEqual({ '042': 300, '107': 250 })
  })
})

describe('clue purchases', () => {
  it('uses escalating costs and rejects insufficient balance', () => {
    expect(EXTRA_CLUE_COSTS).toEqual({ 4: 75, 5: 125, 6: 200 })
    expect(buyClue(progress({ pointBalance: 74 }), 75)).toBeNull()
    expect(buyClue(progress({ pointBalance: 200 }), 75)?.pointBalance).toBe(125)
  })
})

describe('failure penalties', () => {
  it('deducts points according to dossier difficulty', () => {
    expect(FAILURE_PENALTIES).toEqual({ rookie: 50, field: 100, senior: 150, master: 200, legend: 300 })
    const expected = [50, 100, 100, 150, 200, 300]
    dossiers.forEach((dossier, index) => {
      const outcome = applyCaseLoss(progress({ pointBalance: 500 }), dossier)
      expect(outcome.result.deductedPoints).toBe(expected[index])
      expect(outcome.progress.pointBalance).toBe(500 - expected[index])
    })
  })

  it('never lets the balance fall below zero', () => {
    const outcome = applyCaseLoss(progress({ pointBalance: 40 }), dossiers[5], 5)
    expect(outcome.result.configuredPenalty).toBe(300)
    expect(outcome.result.deductedPoints).toBe(40)
    expect(outcome.progress.pointBalance).toBe(0)
    expect(outcome.progress.bestScoresByDossier).toEqual({})
    expect(outcome.progress.recoveryRequired).toBe(true)
    expect(outcome.progress.recoveryDossierIndex).toBe(5)
    expect(outcome.result.recoveryTriggered).toBe(true)
  })

  it('does not trigger recovery while a positive balance remains', () => {
    const outcome = applyCaseLoss(progress({ pointBalance: 500 }), dossiers[1], 1)
    expect(outcome.progress.pointBalance).toBe(400)
    expect(outcome.progress.recoveryRequired).toBe(false)
  })
})

describe('recovery assignment', () => {
  it('restores a fixed budget without changing rank or case records', () => {
    const before = progress({
      pointBalance: 0,
      highestUnlockedDossier: 4,
      bestScoresByDossier: { '042': 300, '107': 250 },
      recoveryRequired: true,
      recoveryDossierIndex: 4,
    })
    const outcome = applyRecoveryWin(before)
    expect(outcome.result.reward).toBe(RECOVERY_REWARD)
    expect(outcome.result.balance).toBe(100)
    expect(outcome.result.reputationEarned).toBe(20)
    expect(outcome.result.unlockedBadges).toEqual(expect.arrayContaining(['comeback', 'eagleEye', 'pureDeduction']))
    expect(outcome.progress.pointBalance).toBe(100)
    expect(outcome.progress.recoveryRequired).toBe(false)
    expect(outcome.progress.highestUnlockedDossier).toBe(4)
    expect(outcome.progress.bestScoresByDossier).toEqual(before.bestScoresByDossier)
  })
})

describe('progress migration', () => {
  it('preserves unlocked dossiers and grants minimum completion scores', () => {
    const values = new Map([['geo-detective:unlocked-dossier', '2']])
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }
    const migrated = loadProgress(storage)
    expect(migrated.highestUnlockedDossier).toBe(2)
    expect(migrated.bestScoresByDossier).toEqual({ '042': 100, '107': 125 })
    expect(migrated.pointBalance).toBe(225)
    expect(storage.setItem).toHaveBeenCalledWith(PROGRESS_KEY, JSON.stringify(migrated))
  })

  it('loads and sanitizes versioned progress', () => {
    const saved = progress({ pointBalance: 275, highestUnlockedDossier: 1, bestScoresByDossier: { '042': 300 } })
    const storage = { getItem: () => JSON.stringify(saved), setItem: vi.fn() }
    expect(loadProgress(storage)).toEqual(saved)
  })

  it('migrates v2 progress without forcing an existing player into recovery', () => {
    const old = {
      version: 2,
      pointBalance: 0,
      highestUnlockedDossier: 3,
      bestScoresByDossier: { '042': 300 },
    }
    const values = new Map([[OLDER_PROGRESS_KEY, JSON.stringify(old)]])
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }
    const migrated = loadProgress(storage)
    expect(migrated.version).toBe(4)
    expect(migrated.recoveryRequired).toBe(false)
    expect(migrated.recoveryDossierIndex).toBe(3)
    expect(storage.setItem).toHaveBeenCalledWith(PROGRESS_KEY, JSON.stringify(migrated))
  })

  it('migrates v3 progress and preserves recovery state', () => {
    const old = {
      version: 3,
      pointBalance: 0,
      highestUnlockedDossier: 4,
      bestScoresByDossier: { '042': 300 },
      recoveryRequired: true,
      recoveryDossierIndex: 3,
    }
    const values = new Map([[PREVIOUS_PROGRESS_KEY, JSON.stringify(old)]])
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }
    const migrated = loadProgress(storage)
    expect(migrated.version).toBe(4)
    expect(migrated.recoveryRequired).toBe(true)
    expect(migrated.recoveryDossierIndex).toBe(3)
    expect(migrated.reputation).toBe(0)
  })
})
