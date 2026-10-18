import type { Clue, Locale, WeatherSnapshot } from './types'

export const copy = {
  vi: {
    eyebrow: 'CỤC ĐIỀU TRA ĐỊA LÝ QUỐC TẾ',
    title: 'GEO—DETECTIVE',
    subtitle: 'Hồ sơ truy nã xuyên quốc gia',
    caseArchive: 'KHO HỒ SƠ',
    chooseCase: 'CHỌN HỒ SƠ ĐIỀU TRA',
    archiveHint: 'Phá án để mở khóa hồ sơ khó hơn. Tiến độ được lưu trên thiết bị này.',
    locked: 'BỊ KHÓA',
    cluesCount: 'manh mối',
    suspectsCount: 'quốc gia',
    points: 'ĐIỂM ĐIỀU TRA',
    bestScore: 'kỷ lục',
    classified: 'TỐI MẬT',
    briefing: 'NHIỆM VỤ KHẨN',
    briefingBody: 'Mật danh “Bóng Ma Meridian” vừa rời Bangkok với hộ chiếu giả. Hắn sẽ đổi quốc gia sau mỗi lần bạn đoán sai. Bạn có đúng ba ngày để lần theo dữ liệu và khóa đường trốn.',
    start: 'MỞ HỒ SƠ ĐIỀU TRA',
    loading: 'Đang giải mã dữ liệu tình báo…',
    day: 'NGÀY',
    daysRemaining: 'ngày còn lại',
    evidence: 'BẢNG MANH MỐI',
    encryptedClue: 'Dữ liệu này vẫn đang bị mã hóa.',
    unlock: 'GIẢI MÃ',
    notEnoughPoints: 'Bạn không đủ điểm điều tra để giải mã manh mối này.',
    lead: 'TIN BÁO TRỰC TIẾP',
    weatherLoading: 'Đang bắt tín hiệu thời tiết tại thủ đô…',
    timezoneFallback: 'Mất tín hiệu khí tượng. Thiết bị của nghi phạm vừa đồng bộ theo múi giờ {timezone}.',
    choose: 'CHỌN ĐIỂM ĐẾN',
    search: 'Tìm quốc gia trong danh sách…',
    arrest: 'TIẾN HÀNH BẮT GIỮ',
    wrong: 'Trượt mục tiêu. Nghi phạm đã rời {country}; hồ sơ ngày mới đã được mở.',
    dataNetwork: 'DỮ LIỆU TRỰC TUYẾN',
    dataCache: 'DỮ LIỆU ĐÃ XÁC THỰC',
    dataFallback: 'CHẾ ĐỘ NGOẠI TUYẾN',
    wonTitle: 'VỤ ÁN KHÉP LẠI',
    wonBody: 'Bạn đã chặn đứng mục tiêu tại {country} trong ngày thứ {day}. Một suy luận hoàn hảo.',
    lostTitle: 'MỤC TIÊU ĐÃ BIẾN MẤT',
    lostBody: 'Ba ngày đã hết. Điểm cuối cùng được xác nhận là {country}. Hồ sơ sẽ được mở lại khi bạn sẵn sàng.',
    replay: 'MỞ VỤ ÁN MỚI',
    nextCase: 'HỒ SƠ TIẾP THEO',
    caseScore: 'ĐIỂM VỤ ÁN',
    previousBest: 'KỶ LỤC CŨ',
    pointsEarned: 'ĐIỂM THỰC NHẬN',
    pointsSpent: 'ĐÃ DÙNG TRONG LƯỢT',
    casePenalty: 'MỨC PHẠT HỒ SƠ',
    pointsDeducted: 'ĐIỂM BỊ TRỪ',
    newBalance: 'SỐ DƯ MỚI',
    selectPrompt: 'Chọn một quốc gia trước khi hành động.',
    recoveryFile: 'HỒ SƠ PHỤC HỒI',
    recoveryStatus: 'ĐÌNH CHỈ NGÂN SÁCH',
    recoveryTitle: 'CHIẾN DỊCH TÁI THẨM ĐỊNH',
    recoveryBriefing: 'Điểm điều tra đã cạn. Cục trưởng giao một hồ sơ khẩn cùng cấp bậc để bạn khôi phục quyền truy cập. Hồ sơ có ba manh mối miễn phí, danh sách mục tiêu được thu hẹp và không phát sinh thêm hình phạt.',
    recoveryArchiveHint: 'Danh hiệu và thành tích của bạn vẫn được bảo toàn. Phá hồ sơ phục hồi để trở lại chiến dịch chính.',
    startRecovery: 'NHẬN NHIỆM VỤ PHỤC HỒI',
    recoveryBadge: 'NHIỆM VỤ PHỤC HỒI · KHÔNG TRỪ THÊM ĐIỂM',
    recoveryWonTitle: 'QUYỀN TRUY CẬP ĐÃ KHÔI PHỤC',
    recoveryWonBody: 'Bạn đã hoàn tất tái thẩm định tại {country}. Ngân sách điều tra được cấp lại và chiến dịch chính đã mở.',
    recoveryLostTitle: 'TÁI THẨM ĐỊNH CHƯA ĐẠT',
    recoveryLostBody: 'Mục tiêu đã rời {country}, nhưng Cục không trừ thêm điểm. Bạn có thể nhận một hồ sơ phục hồi mới ngay lập tức.',
    recoveryReward: 'ĐIỂM KHÔI PHỤC',
    resumeCampaign: 'TRỞ LẠI CHIẾN DỊCH',
    retryRecovery: 'THỬ HỒ SƠ KHÁC',
    recoveryRequired: 'Số dư đã về 0. Một Hồ sơ phục hồi đã được mở; cấp bậc và các hồ sơ đã hoàn thành vẫn được giữ nguyên.',
    noFurtherPenalty: 'KHÔNG PHẠT THÊM',
    careerProfile: 'HỒ SƠ THÁM TỬ',
    reputation: 'DANH TIẾNG',
    dailyReputation: 'THƯỞNG DANH TIẾNG HÔM NAY',
    nextRank: 'Còn {points} danh tiếng để đạt {rank}',
    maxRank: 'Đã đạt cấp bậc cao nhất',
    badges: 'HUY HIỆU THÀNH TÍCH',
    noBadges: 'Chưa có huy hiệu — hãy phá vụ án đầu tiên.',
    reputationEarned: 'DANH TIẾNG NHẬN ĐƯỢC',
    dailyCapReached: 'Đã đạt giới hạn thưởng danh tiếng hôm nay. Huy hiệu và thống kê vẫn được cập nhật.',
    rankUp: 'THĂNG CẤP',
    badgeUnlocked: 'HUY HIỆU MỚI',
    footer: 'Dữ liệu địa lý: REST Countries · Thời tiết: Open-Meteo',
  },
  en: {
    eyebrow: 'INTERNATIONAL GEOGRAPHIC INVESTIGATION BUREAU',
    title: 'GEO—DETECTIVE',
    subtitle: 'A transnational manhunt dossier',
    caseArchive: 'CASE ARCHIVE',
    chooseCase: 'SELECT AN INVESTIGATION',
    archiveHint: 'Close a case to unlock harder dossiers. Progress is saved on this device.',
    locked: 'LOCKED',
    cluesCount: 'clues',
    suspectsCount: 'countries',
    points: 'INTEL POINTS',
    bestScore: 'best score',
    classified: 'CLASSIFIED',
    briefing: 'URGENT BRIEFING',
    briefingBody: 'The fugitive codenamed “Meridian Ghost” has left Bangkok on a forged passport. They will change countries after every failed guess. You have exactly three days to trace the data and close the net.',
    start: 'OPEN INVESTIGATION',
    loading: 'Decrypting intelligence feeds…',
    day: 'DAY',
    daysRemaining: 'days remaining',
    evidence: 'EVIDENCE BOARD',
    encryptedClue: 'This intelligence fragment remains encrypted.',
    unlock: 'DECRYPT',
    notEnoughPoints: 'You do not have enough intel points to decrypt this clue.',
    lead: 'LIVE INTELLIGENCE',
    weatherLoading: 'Acquiring weather signal at the capital…',
    timezoneFallback: 'Weather signal lost. The suspect’s device just synced to {timezone}.',
    choose: 'CHOOSE DESTINATION',
    search: 'Search the country shortlist…',
    arrest: 'AUTHORIZE ARREST',
    wrong: 'Target missed. The suspect fled {country}; a new daily file is now open.',
    dataNetwork: 'LIVE DATA FEED',
    dataCache: 'VERIFIED CACHE',
    dataFallback: 'OFFLINE MODE',
    wonTitle: 'CASE CLOSED',
    wonBody: 'You intercepted the target in {country} on day {day}. Flawless deduction.',
    lostTitle: 'TARGET DISAPPEARED',
    lostBody: 'The three-day window is over. The final confirmed location was {country}. Reopen the case when ready.',
    replay: 'OPEN NEW CASE',
    nextCase: 'NEXT DOSSIER',
    caseScore: 'CASE SCORE',
    previousBest: 'PREVIOUS BEST',
    pointsEarned: 'POINTS EARNED',
    pointsSpent: 'SPENT THIS RUN',
    casePenalty: 'CASE PENALTY',
    pointsDeducted: 'POINTS DEDUCTED',
    newBalance: 'NEW BALANCE',
    selectPrompt: 'Choose a country before making your move.',
    recoveryFile: 'RECOVERY FILE',
    recoveryStatus: 'BUDGET SUSPENDED',
    recoveryTitle: 'FIELD RECERTIFICATION',
    recoveryBriefing: 'Your intel balance is depleted. Command has assigned an urgent case at your current rank to restore access. It includes three free clues, a reduced target list, and no further point penalty.',
    recoveryArchiveHint: 'Your rank and completed cases remain intact. Close the recovery file to resume the main campaign.',
    startRecovery: 'ACCEPT RECOVERY ASSIGNMENT',
    recoveryBadge: 'RECOVERY ASSIGNMENT · NO FURTHER DEDUCTION',
    recoveryWonTitle: 'ACCESS RESTORED',
    recoveryWonBody: 'You completed recertification in {country}. Your intel budget has been restored and the main campaign is available again.',
    recoveryLostTitle: 'RECERTIFICATION INCOMPLETE',
    recoveryLostBody: 'The target escaped {country}, but Command deducted no further points. You can accept a new recovery file immediately.',
    recoveryReward: 'RECOVERY CREDIT',
    resumeCampaign: 'RESUME CAMPAIGN',
    retryRecovery: 'TRY ANOTHER FILE',
    recoveryRequired: 'Your balance reached 0. A Recovery File is now open; your rank and completed cases remain intact.',
    noFurtherPenalty: 'NO FURTHER PENALTY',
    careerProfile: 'DETECTIVE PROFILE',
    reputation: 'REPUTATION',
    dailyReputation: 'REPUTATION REWARDS TODAY',
    nextRank: '{points} reputation until {rank}',
    maxRank: 'Highest rank achieved',
    badges: 'ACHIEVEMENT BADGES',
    noBadges: 'No badges yet — close your first case.',
    reputationEarned: 'REPUTATION EARNED',
    dailyCapReached: 'Today’s reputation reward limit has been reached. Badges and statistics still update.',
    rankUp: 'RANK UP',
    badgeUnlocked: 'NEW BADGE',
    footer: 'Geography: REST Countries · Weather: Open-Meteo',
  },
} as const

const regionNames: Record<Locale, Record<string, string>> = {
  vi: { Asia: 'châu Á', Europe: 'châu Âu', Africa: 'châu Phi', Americas: 'châu Mỹ', Oceania: 'châu Đại Dương' },
  en: { Asia: 'Asia', Europe: 'Europe', Africa: 'Africa', Americas: 'the Americas', Oceania: 'Oceania' },
}

export function formatClue(clue: Clue, locale: Locale): string {
  if (clue.kind === 'regionLanguage') {
    const region = regionNames[locale][String(clue.params.region)] ?? String(clue.params.region)
    return locale === 'vi'
      ? `Nghi phạm đang ở ${region}, tại một quốc gia sử dụng tiếng ${clue.params.language}.`
      : `The suspect is in ${region}, in a country where ${clue.params.language} is spoken.`
  }
  if (clue.kind === 'currency') {
    return locale === 'vi'
      ? `Một giao dịch vừa xuất hiện bằng ${clue.params.name} — mã ${clue.params.code}.`
      : `A transaction was just flagged in ${clue.params.name} — code ${clue.params.code}.`
  }
  if (clue.kind === 'currencySymbol') {
    return locale === 'vi'
      ? `Biên lai bị cháy chỉ còn đọc được ký hiệu tiền tệ “${clue.params.symbol}”.`
      : `The burned receipt only reveals the currency symbol “${clue.params.symbol}”.`
  }
  if (clue.kind === 'borders') {
    const count = Number(clue.params.count)
    if (locale === 'vi') {
      return count === 0
        ? 'Quốc gia này không có đường biên giới đất liền.'
        : `Quốc gia này có đường biên giới đất liền với ${count} nước.`
    }
    return count === 0
      ? 'This country has no land borders.'
      : `This country shares a land border with ${count} ${count === 1 ? 'nation' : 'nations'}.`
  }
  if (clue.kind === 'subregion') {
    return locale === 'vi'
      ? `Báo cáo tuyến đường thu hẹp vị trí về tiểu vùng ${clue.params.subregion}.`
      : `The route analysis narrows the location to the ${clue.params.subregion} subregion.`
  }
  if (clue.kind === 'timezone') {
    return locale === 'vi'
      ? `Đồng hồ mã hóa của nghi phạm vừa đồng bộ với ${clue.params.timezone}.`
      : `The suspect’s encrypted watch just synchronized to ${clue.params.timezone}.`
  }
  if (clue.kind === 'hemisphere') {
    const [vertical, horizontal] = String(clue.params.hemisphere).split('-')
    const viVertical = vertical === 'north' ? 'Bắc' : 'Nam'
    const viHorizontal = horizontal === 'east' ? 'Đông' : 'Tây'
    return locale === 'vi'
      ? `Phân tích bóng nắng đặt thủ đô ở bán cầu ${viVertical} và bán cầu ${viHorizontal}.`
      : `Shadow analysis places the capital in the ${vertical}ern and ${horizontal}ern hemispheres.`
  }
  if (clue.kind === 'capitalPattern') {
    return locale === 'vi'
      ? `Tên thủ đô bắt đầu bằng “${clue.params.initial}” và có ${clue.params.length} chữ cái.`
      : `The capital begins with “${clue.params.initial}” and contains ${clue.params.length} letters.`
  }
  const count = Number(clue.params.count)
  return locale === 'vi'
    ? `Hồ sơ ngoại giao ghi nhận ${count} ngôn ngữ chính thức tại quốc gia này.`
    : `Diplomatic records list ${count} official ${count === 1 ? 'language' : 'languages'} in this country.`
}

function weatherLabel(code: number | undefined, precipitation: number | undefined, locale: Locale) {
  if ((precipitation ?? 0) > 0 || (code !== undefined && code >= 51)) return locale === 'vi' ? 'đang có mưa' : 'rain is being reported'
  if (code !== undefined && code <= 1) return locale === 'vi' ? 'trời quang' : 'skies are clear'
  return locale === 'vi' ? 'nhiều mây' : 'cloud cover is present'
}

export function formatWeather(weather: WeatherSnapshot, capital: string, locale: Locale): string {
  const condition = weatherLabel(weather.weatherCode, weather.precipitation, locale)
  return locale === 'vi'
    ? `Trạm tại ${capital} ghi nhận ${condition}, nhiệt độ khoảng ${Math.round(weather.temperature ?? 0)}°C.`
    : `The station in ${capital} reports ${condition}, at roughly ${Math.round(weather.temperature ?? 0)}°C.`
}

export function interpolate(value: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce((result, [key, item]) => result.replace(`{${key}}`, String(item)), value)
}
