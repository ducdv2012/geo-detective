import type {
  BadgeId,
  DetectiveRankId,
  DossierDifficulty,
  Locale,
  PlayerProgress,
} from "../types";
import { appConfig } from "../../app.config";

export const DAILY_REPUTATION_CASE_LIMIT =
  appConfig.career.dailyReputationCaseLimit;

export const detectiveRanks: Array<{
  id: DetectiveRankId;
  minimum: number;
  label: Record<Locale, string>;
}> = appConfig.career.ranks.map((rank) => ({
  id: rank.id as DetectiveRankId,
  minimum: rank.minimum,
  label: { ...rank.label },
}));

export const badgeCatalog: Record<
  BadgeId,
  {
    icon: string;
    name: Record<Locale, string>;
    description: Record<Locale, string>;
  }
> = {
  eagleEye: {
    icon: "◉",
    name: { vi: "Mắt Đại Bàng", en: "Eagle Eye" },
    description: {
      vi: "Phá án ngay trong ngày đầu.",
      en: "Close a case on day one.",
    },
  },
  pureDeduction: {
    icon: "◇",
    name: { vi: "Suy Luận Thuần Túy", en: "Pure Deduction" },
    description: {
      vi: "Phá án mà không mua manh mối.",
      en: "Close a case without buying clues.",
    },
  },
  noFlag: {
    icon: "▧",
    name: { vi: "Không Dấu Cờ", en: "Flagless" },
    description: {
      vi: "Phá một hồ sơ đã ẩn quốc kỳ.",
      en: "Close a dossier with hidden flags.",
    },
  },
  streakThree: {
    icon: "Ⅲ",
    name: { vi: "Không Để Lại Dấu Vết", en: "No Loose Ends" },
    description: {
      vi: "Phá ba vụ án liên tiếp.",
      en: "Close three cases in a row.",
    },
  },
  comeback: {
    icon: "↟",
    name: { vi: "Trở Lại Từ Bóng Tối", en: "Back From The Dark" },
    description: {
      vi: "Hoàn thành một Hồ sơ phục hồi.",
      en: "Complete a Recovery File.",
    },
  },
  continentSpecialist: {
    icon: "◎",
    name: { vi: "Chuyên Gia Châu Lục", en: "Continental Specialist" },
    description: {
      vi: "Phá năm vụ án trong cùng một châu lục.",
      en: "Close five cases in the same continent.",
    },
  },
  legendThreeClues: {
    icon: "✦",
    name: { vi: "Bộ Não Huyền Thoại", en: "Legendary Mind" },
    description: {
      vi: "Phá hồ sơ Huyền thoại chỉ với ba manh mối.",
      en: "Close a Legend dossier using only three clues.",
    },
  },
};

export function getDetectiveRank(reputation: number) {
  return (
    [...detectiveRanks].reverse().find((rank) => reputation >= rank.minimum) ??
    detectiveRanks[0]
  );
}

export function getRankProgress(reputation: number) {
  const rankIndex = detectiveRanks.findIndex(
    (rank) => rank.id === getDetectiveRank(reputation).id,
  );
  const current = detectiveRanks[rankIndex];
  const next = detectiveRanks[rankIndex + 1] ?? null;
  if (!next) return { current, next, percent: 100, remaining: 0 };
  const span = next.minimum - current.minimum;
  return {
    current,
    next,
    percent: Math.min(
      100,
      Math.max(0, ((reputation - current.minimum) / span) * 100),
    ),
    remaining: Math.max(0, next.minimum - reputation),
  };
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface CareerEvent {
  day: number;
  pointsSpent: number;
  hideFlags: boolean;
  difficulty: DossierDifficulty;
  region: string;
  recovery?: boolean;
  now?: Date;
}

export function awardCareerProgress(
  progress: PlayerProgress,
  event: CareerEvent,
) {
  const dateKey = localDateKey(event.now ?? new Date());
  const casesToday =
    progress.reputationDate === dateKey ? progress.reputationCasesToday : 0;
  const reputationEligible = casesToday < DAILY_REPUTATION_CASE_LIMIT;
  const reputationEarned = reputationEligible
    ? appConfig.career.reputation.base +
      (event.day === 1 ? appConfig.career.reputation.firstDayBonus : 0) +
      (event.pointsSpent === 0
        ? appConfig.career.reputation.noCluePurchaseBonus
        : 0)
    : 0;
  const nextStreak = progress.winStreak + 1;
  const nextRegionWins = (progress.winsByRegion[event.region] ?? 0) + 1;
  const candidates: BadgeId[] = [];
  if (event.day === 1) candidates.push("eagleEye");
  if (event.pointsSpent === 0) candidates.push("pureDeduction");
  if (event.hideFlags) candidates.push("noFlag");
  if (nextStreak >= appConfig.career.badgeThresholds.winStreak)
    candidates.push("streakThree");
  if (event.recovery) candidates.push("comeback");
  if (nextRegionWins >= appConfig.career.badgeThresholds.regionWins)
    candidates.push("continentSpecialist");
  if (event.difficulty === "legend" && event.pointsSpent === 0)
    candidates.push("legendThreeClues");
  const unlockedBadges = candidates.filter(
    (badge) => !progress.earnedBadges.includes(badge),
  );
  const previousRank = getDetectiveRank(progress.reputation);
  const newReputation = progress.reputation + reputationEarned;
  const nextProgress: PlayerProgress = {
    ...progress,
    reputation: newReputation,
    earnedBadges: [...progress.earnedBadges, ...unlockedBadges],
    winStreak: nextStreak,
    winsByRegion: { ...progress.winsByRegion, [event.region]: nextRegionWins },
    reputationDate: dateKey,
    reputationCasesToday: reputationEligible ? casesToday + 1 : casesToday,
  };
  return {
    progress: nextProgress,
    reputationEarned,
    unlockedBadges,
    rankAdvanced: getDetectiveRank(newReputation).id !== previousRank.id,
  };
}
