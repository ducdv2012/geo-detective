import { dossiers } from "../data/dossiers";
import type {
  BadgeId,
  Dossier,
  DossierDifficulty,
  PenaltyResult,
  PlayerProgress,
  RecoveryResult,
  ScoreResult,
} from "../types";
import { awardCareerProgress, badgeCatalog } from "./achievements";
import { appConfig } from "../../app.config";

export const PROGRESS_KEY: string = appConfig.storage.progress;
export const PREVIOUS_PROGRESS_KEY: string = appConfig.storage.previousProgress;
export const OLDER_PROGRESS_KEY: string = appConfig.storage.olderProgress;
export const LEGACY_PROGRESS_KEY: string = appConfig.storage.legacyProgress;
export const RECOVERY_REWARD = appConfig.gameplay.recoveryReward;

export const BASE_SCORE_BY_DAY: Record<number, number> = {
  ...appConfig.gameplay.baseScoreByDay,
};
export const DIFFICULTY_MULTIPLIERS: Record<DossierDifficulty, number> = {
  ...appConfig.gameplay.difficultyMultipliers,
};
export const MAX_CLUES_BY_DIFFICULTY: Record<DossierDifficulty, number> = {
  ...appConfig.gameplay.maxCluesByDifficulty,
};
export const EXTRA_CLUE_COSTS: Record<number, number> = {
  ...appConfig.gameplay.extraClueCosts,
};
export const FAILURE_PENALTIES: Record<DossierDifficulty, number> = {
  ...appConfig.gameplay.failurePenalties,
};

export const createInitialProgress = (): PlayerProgress => ({
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
  reputationDate: "",
  reputationCasesToday: 0,
});

export function calculateCaseScore(
  difficulty: DossierDifficulty,
  day: number,
): number {
  const base = BASE_SCORE_BY_DAY[day] ?? 0;
  return Math.round(base * DIFFICULTY_MULTIPLIERS[difficulty]);
}

export function getDossierMaxClues(dossier: Dossier): number {
  return Math.min(
    dossier.clueKinds.length,
    MAX_CLUES_BY_DIFFICULTY[dossier.difficulty],
  );
}

export function getNextClueCost(nextClueNumber: number): number | null {
  return EXTRA_CLUE_COSTS[nextClueNumber] ?? null;
}

export function buyClue(
  progress: PlayerProgress,
  cost: number,
): PlayerProgress | null {
  if (cost <= 0 || progress.pointBalance < cost) return null;
  return { ...progress, pointBalance: progress.pointBalance - cost };
}

export function applyCaseWin(
  progress: PlayerProgress,
  dossier: Dossier,
  dossierIndex: number,
  day: number,
  pointsSpent: number,
  targetRegion = "Unknown",
  now = new Date(),
): { progress: PlayerProgress; result: ScoreResult } {
  const grossScore = calculateCaseScore(dossier.difficulty, day);
  const previousBest = progress.bestScoresByDossier[dossier.id] ?? 0;
  const earnedPoints = Math.max(0, grossScore - previousBest);
  const highestUnlockedDossier = Math.min(
    Math.max(progress.highestUnlockedDossier, dossierIndex + 1),
    dossiers.length - 1,
  );
  const nextProgress: PlayerProgress = {
    ...progress,
    version: 4,
    pointBalance: progress.pointBalance + earnedPoints,
    highestUnlockedDossier,
    bestScoresByDossier: {
      ...progress.bestScoresByDossier,
      [dossier.id]: Math.max(previousBest, grossScore),
    },
  };
  const career = awardCareerProgress(nextProgress, {
    day,
    pointsSpent,
    hideFlags: dossier.hideFlags,
    difficulty: dossier.difficulty,
    region: targetRegion,
    now,
  });
  return {
    progress: career.progress,
    result: {
      grossScore,
      previousBest,
      earnedPoints,
      pointsSpent,
      balance: nextProgress.pointBalance,
      reputationEarned: career.reputationEarned,
      newReputation: career.progress.reputation,
      unlockedBadges: career.unlockedBadges,
      rankAdvanced: career.rankAdvanced,
    },
  };
}

export function applyCaseLoss(
  progress: PlayerProgress,
  dossier: Dossier,
  dossierIndex = progress.highestUnlockedDossier,
): { progress: PlayerProgress; result: PenaltyResult } {
  const configuredPenalty = FAILURE_PENALTIES[dossier.difficulty];
  const deductedPoints = Math.min(progress.pointBalance, configuredPenalty);
  const nextProgress = {
    ...progress,
    pointBalance: progress.pointBalance - deductedPoints,
    recoveryRequired: progress.pointBalance - deductedPoints === 0,
    recoveryDossierIndex: Math.min(
      Math.max(dossierIndex, 0),
      dossiers.length - 1,
    ),
    winStreak: 0,
  };
  return {
    progress: nextProgress,
    result: {
      configuredPenalty,
      deductedPoints,
      balance: nextProgress.pointBalance,
      recoveryTriggered: nextProgress.recoveryRequired,
    },
  };
}

export function applyRecoveryWin(
  progress: PlayerProgress,
  dossier: Dossier = dossiers[progress.recoveryDossierIndex] ?? dossiers[0],
  day = 1,
  targetRegion = "Unknown",
  now = new Date(),
): { progress: PlayerProgress; result: RecoveryResult } {
  const recoveredProgress: PlayerProgress = {
    ...progress,
    pointBalance: progress.pointBalance + RECOVERY_REWARD,
    recoveryRequired: false,
  };
  const career = awardCareerProgress(recoveredProgress, {
    day,
    pointsSpent: 0,
    hideFlags: dossier.hideFlags,
    difficulty: dossier.difficulty,
    region: targetRegion,
    recovery: true,
    now,
  });
  return {
    progress: career.progress,
    result: {
      reward: RECOVERY_REWARD,
      balance: career.progress.pointBalance,
      reputationEarned: career.reputationEarned,
      newReputation: career.progress.reputation,
      unlockedBadges: career.unlockedBadges,
      rankAdvanced: career.rankAdvanced,
    },
  };
}

export function applyRecoveryLoss(progress: PlayerProgress): PlayerProgress {
  return { ...progress, winStreak: 0 };
}

function sanitizeProgress(value: unknown): PlayerProgress | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PlayerProgress>;
  if (candidate.version !== 4) return null;
  const pointBalance = Number(candidate.pointBalance);
  const highestUnlockedDossier = Number(candidate.highestUnlockedDossier);
  if (
    !Number.isFinite(pointBalance) ||
    !Number.isFinite(highestUnlockedDossier)
  )
    return null;
  return {
    version: 4,
    pointBalance: Math.max(0, Math.floor(pointBalance)),
    highestUnlockedDossier: Math.min(
      Math.max(Math.floor(highestUnlockedDossier), 0),
      dossiers.length - 1,
    ),
    bestScoresByDossier:
      candidate.bestScoresByDossier &&
      typeof candidate.bestScoresByDossier === "object"
        ? Object.fromEntries(
            Object.entries(candidate.bestScoresByDossier).filter(
              ([, score]) => Number.isFinite(score) && score >= 0,
            ),
          )
        : {},
    recoveryRequired: candidate.recoveryRequired === true,
    recoveryDossierIndex: Math.min(
      Math.max(Math.floor(Number(candidate.recoveryDossierIndex) || 0), 0),
      dossiers.length - 1,
    ),
    reputation: Math.max(0, Math.floor(Number(candidate.reputation) || 0)),
    earnedBadges: Array.isArray(candidate.earnedBadges)
      ? candidate.earnedBadges.filter(
          (badge): badge is BadgeId =>
            typeof badge === "string" && badge in badgeCatalog,
        )
      : [],
    winStreak: Math.max(0, Math.floor(Number(candidate.winStreak) || 0)),
    winsByRegion:
      candidate.winsByRegion && typeof candidate.winsByRegion === "object"
        ? Object.fromEntries(
            Object.entries(candidate.winsByRegion).filter(
              ([, wins]) => Number.isFinite(wins) && wins >= 0,
            ),
          )
        : {},
    reputationDate:
      typeof candidate.reputationDate === "string"
        ? candidate.reputationDate
        : "",
    reputationCasesToday: Math.min(
      appConfig.career.dailyReputationCaseLimit,
      Math.max(0, Math.floor(Number(candidate.reputationCasesToday) || 0)),
    ),
  };
}

function migratePreviousVersion(
  value: unknown,
  expectedVersion: 2 | 3,
): PlayerProgress | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {
    version?: number;
    pointBalance?: number;
    highestUnlockedDossier?: number;
    bestScoresByDossier?: Record<string, number>;
    recoveryRequired?: boolean;
    recoveryDossierIndex?: number;
  };
  if (candidate.version !== expectedVersion) return null;
  const pointBalance = Number(candidate.pointBalance);
  const highestUnlockedDossier = Number(candidate.highestUnlockedDossier);
  if (
    !Number.isFinite(pointBalance) ||
    !Number.isFinite(highestUnlockedDossier)
  )
    return null;
  return {
    version: 4,
    pointBalance: Math.max(0, Math.floor(pointBalance)),
    highestUnlockedDossier: Math.min(
      Math.max(Math.floor(highestUnlockedDossier), 0),
      dossiers.length - 1,
    ),
    bestScoresByDossier:
      candidate.bestScoresByDossier &&
      typeof candidate.bestScoresByDossier === "object"
        ? Object.fromEntries(
            Object.entries(candidate.bestScoresByDossier).filter(
              ([, score]) => Number.isFinite(score) && score >= 0,
            ),
          )
        : {},
    recoveryRequired:
      expectedVersion === 3 && candidate.recoveryRequired === true,
    recoveryDossierIndex: Math.min(
      Math.max(
        Math.floor(
          expectedVersion === 3
            ? Number(candidate.recoveryDossierIndex) || 0
            : highestUnlockedDossier,
        ),
        0,
      ),
      dossiers.length - 1,
    ),
    reputation: 0,
    earnedBadges: [],
    winStreak: 0,
    winsByRegion: {},
    reputationDate: "",
    reputationCasesToday: 0,
  };
}

export function migrateLegacyProgress(
  storage: Pick<Storage, "getItem">,
): PlayerProgress {
  const rawIndex = Number.parseInt(
    storage.getItem(LEGACY_PROGRESS_KEY) ?? "0",
    10,
  );
  const highestUnlockedDossier = Number.isFinite(rawIndex)
    ? Math.min(Math.max(rawIndex, 0), dossiers.length - 1)
    : 0;
  const completed = dossiers.slice(0, highestUnlockedDossier);
  const bestScoresByDossier = Object.fromEntries(
    completed.map((dossier) => [
      dossier.id,
      calculateCaseScore(dossier.difficulty, appConfig.gameplay.maxDays),
    ]),
  );
  return {
    version: 4,
    highestUnlockedDossier,
    bestScoresByDossier,
    pointBalance: Object.values(bestScoresByDossier).reduce(
      (sum, score) => sum + score,
      0,
    ),
    recoveryRequired: false,
    recoveryDossierIndex: highestUnlockedDossier,
    reputation: 0,
    earnedBadges: [],
    winStreak: 0,
    winsByRegion: {},
    reputationDate: "",
    reputationCasesToday: 0,
  };
}

export function loadProgress(
  storage: Pick<Storage, "getItem" | "setItem">,
): PlayerProgress {
  try {
    const stored = storage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed = sanitizeProgress(JSON.parse(stored));
      if (parsed) return parsed;
    }
    const previous = storage.getItem(PREVIOUS_PROGRESS_KEY);
    if (previous) {
      const migrated = migratePreviousVersion(JSON.parse(previous), 3);
      if (migrated) {
        saveProgress(storage, migrated);
        return migrated;
      }
    }
    const older = storage.getItem(OLDER_PROGRESS_KEY);
    if (older) {
      const migrated = migratePreviousVersion(JSON.parse(older), 2);
      if (migrated) {
        saveProgress(storage, migrated);
        return migrated;
      }
    }
    const migrated = migrateLegacyProgress(storage);
    saveProgress(storage, migrated);
    return migrated;
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(
  storage: Pick<Storage, "setItem">,
  progress: PlayerProgress,
) {
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // The current session continues even when persistent storage is unavailable.
  }
}
