/**
 * Single source of truth for Geo-Detective's deploy-time and gameplay settings.
 * Edit this file to rebrand the site, move APIs, or rebalance the campaign.
 */
export const appConfig = {
  site: {
    name: "Geo-Detective",
    wordmark: "GEO—DETECTIVE",
    browserTitle: "Geo-Detective | Truy tìm tội phạm xuyên quốc gia",
    defaultLocale: "vi",
    bureau: {
      vi: "CỤC ĐIỀU TRA ĐỊA LÝ QUỐC TẾ",
      en: "INTERNATIONAL GEOGRAPHIC INVESTIGATION BUREAU",
    },
    description:
      "Geo-Detective — phá án bằng kiến thức địa lý và dữ liệu thời tiết thực tế.",
    socialTitle: "Geo-Detective — Truy tìm tội phạm xuyên quốc gia",
    socialDescription:
      "Giải mã manh mối địa lý, phá án trong ba ngày và xây dựng sự nghiệp thám tử của bạn.",
    socialImageAlt:
      "Geo-Detective — ba huy hiệu thành tích Mắt Đại Bàng, Suy Luận Thuần Túy và Trở Lại Từ Bóng Tối",
    twitterDescription: "Bạn có thể phá án trước khi mục tiêu biến mất không?",
    publicUrl: "https://carte-noir.vercel.app",
    themeColor: "#10100f",
    faviconPath: "/favicon.svg",
    socialImagePath: "/geo-detective-achievements-v2.png",
    copyrightYear: 2026,
  },
  data: {
    countriesUrl:
      "https://restcountries.com/v3.1/all?fields=name,cca3,capital,region,subregion,languages,currencies,borders,timezones,capitalInfo,translations,flag",
    weatherUrl: "https://api.open-meteo.com/v1/forecast",
    countryCacheTtlMs: 24 * 60 * 60 * 1000,
  },
  storage: {
    countries: "geo-detective:countries:v1",
    uiPreferences: "geo-detective:ui:v1",
    progress: "geo-detective:progress:v4",
    previousProgress: "geo-detective:progress:v3",
    olderProgress: "geo-detective:progress:v2",
    legacyProgress: "geo-detective:unlocked-dossier",
  },
  gameplay: {
    maxDays: 3,
    freeClues: 3,
    minimumPlayableCountries: 8,
    recoveryReward: 100,
    baseScoreByDay: { 1: 300, 2: 200, 3: 100 },
    difficultyMultipliers: {
      rookie: 1,
      field: 1.25,
      senior: 1.5,
      master: 1.75,
      legend: 2,
    },
    maxCluesByDifficulty: {
      rookie: 3,
      field: 4,
      senior: 5,
      master: 5,
      legend: 6,
    },
    extraClueCosts: { 4: 75, 5: 125, 6: 200 },
    failurePenalties: {
      rookie: 50,
      field: 100,
      senior: 150,
      master: 200,
      legend: 300,
    },
  },
  career: {
    dailyReputationCaseLimit: 3,
    defaultSoundEnabled: true,
    reputation: { base: 10, firstDayBonus: 5, noCluePurchaseBonus: 5 },
    ranks: [
      { id: "trainee", minimum: 0, label: { vi: "Tập sự", en: "Trainee" } },
      {
        id: "investigator",
        minimum: 100,
        label: { vi: "Điều tra viên", en: "Investigator" },
      },
      {
        id: "fieldDetective",
        minimum: 250,
        label: { vi: "Thám tử hiện trường", en: "Field Detective" },
      },
      {
        id: "seniorDetective",
        minimum: 500,
        label: { vi: "Thám tử cao cấp", en: "Senior Detective" },
      },
      {
        id: "masterDetective",
        minimum: 900,
        label: { vi: "Bậc thầy suy luận", en: "Master Detective" },
      },
      {
        id: "legendaryDetective",
        minimum: 1400,
        label: { vi: "Huyền thoại Interpol", en: "Interpol Legend" },
      },
    ],
    badgeThresholds: { winStreak: 3, regionWins: 5 },
  },
  social: {
    achievementFilename: "geo-detective-achievement.png",
    facebookWindowName: "geo-detective-facebook",
    hashtags: "#GeoDetective #DetectiveGame",
    featuredBadgeLimit: 3,
  },
} as const;

export type AppConfig = typeof appConfig;
