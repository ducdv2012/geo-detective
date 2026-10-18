import { describe, expect, it } from 'vitest'
import { createInitialProgress } from './progress'
import {
  awardCareerProgress,
  DAILY_REPUTATION_CASE_LIMIT,
  getDetectiveRank,
  getRankProgress,
} from './achievements'

const event = (overrides: Partial<Parameters<typeof awardCareerProgress>[1]> = {}) => ({
  day: 2,
  pointsSpent: 75,
  hideFlags: false,
  difficulty: 'field' as const,
  region: 'Asia',
  now: new Date(2026, 9, 18, 10),
  ...overrides,
})

describe('detective reputation and ranks', () => {
  it('uses permanent reputation thresholds for every rank', () => {
    expect([0, 100, 250, 500, 900, 1400].map((value) => getDetectiveRank(value).id)).toEqual([
      'trainee', 'investigator', 'fieldDetective', 'seniorDetective', 'masterDetective', 'legendaryDetective',
    ])
    expect(getRankProgress(99).remaining).toBe(1)
    expect(getRankProgress(1400).percent).toBe(100)
  })

  it('rewards speed and pure deduction without changing intel points', () => {
    const start = createInitialProgress()
    const outcome = awardCareerProgress(start, event({ day: 1, pointsSpent: 0 }))
    expect(outcome.reputationEarned).toBe(20)
    expect(outcome.progress.pointBalance).toBe(0)
    expect(outcome.unlockedBadges).toEqual(expect.arrayContaining(['eagleEye', 'pureDeduction']))
  })

  it('caps reputation after three rewarded cases per day but keeps achievement progress', () => {
    let current = createInitialProgress()
    const rewards: number[] = []
    for (let index = 0; index < 5; index += 1) {
      const outcome = awardCareerProgress(current, event())
      rewards.push(outcome.reputationEarned)
      current = outcome.progress
    }
    expect(rewards).toEqual([10, 10, 10, 0, 0])
    expect(current.reputationCasesToday).toBe(DAILY_REPUTATION_CASE_LIMIT)
    expect(current.winsByRegion.Asia).toBe(5)
    expect(current.earnedBadges).toEqual(expect.arrayContaining(['streakThree', 'continentSpecialist']))
  })

  it('resets the daily reward count on a new local day', () => {
    let current = createInitialProgress()
    for (let index = 0; index < 3; index += 1) current = awardCareerProgress(current, event()).progress
    const tomorrow = awardCareerProgress(current, event({ now: new Date(2026, 9, 19, 10) }))
    expect(tomorrow.reputationEarned).toBe(10)
    expect(tomorrow.progress.reputationCasesToday).toBe(1)
  })

  it('unlocks high-skill and recovery badges only once', () => {
    const legend = awardCareerProgress(createInitialProgress(), event({
      day: 1, pointsSpent: 0, hideFlags: true, difficulty: 'legend', recovery: true,
    }))
    expect(legend.unlockedBadges).toEqual(expect.arrayContaining([
      'eagleEye', 'pureDeduction', 'noFlag', 'comeback', 'legendThreeClues',
    ]))
    const repeated = awardCareerProgress(legend.progress, event({
      day: 1, pointsSpent: 0, hideFlags: true, difficulty: 'legend', recovery: true,
    }))
    expect(repeated.unlockedBadges).toEqual([])
  })
})
