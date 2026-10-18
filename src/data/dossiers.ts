import type { Dossier } from "../types";

export const dossiers: Dossier[] = [
  {
    id: "042",
    difficulty: "rookie",
    origin: "BANGKOK",
    optionCount: 8,
    title: { vi: "Bóng Ma Meridian", en: "Meridian Ghost" },
    briefing: {
      vi: "Nghi phạm rời Bangkok với hộ chiếu giả. Các giao dịch và dữ liệu biên giới vẫn còn rõ — đây là cơ hội tốt nhất để khóa đường trốn.",
      en: "The suspect left Bangkok on a forged passport. Their transactions and border trail remain clear — this is your best chance to close the net.",
    },
    clueKinds: ["regionLanguage", "currency", "borders"],
    hideFlags: false,
    hideCodes: false,
  },
  {
    id: "107",
    difficulty: "field",
    origin: "PARIS",
    optionCount: 10,
    title: { vi: "Tiền Im Lặng", en: "Silent Currency" },
    briefing: {
      vi: "Một môi giới chợ đen biến mất khỏi Paris. Hắn đổi danh tính, nhưng không thể che giấu ngôn ngữ và dấu vết thanh toán.",
      en: "A black-market broker vanished from Paris. They changed identities, but could not erase their language and payment trail.",
    },
    clueKinds: ["subregion", "languageCount", "currency", "borders"],
    hideFlags: false,
    hideCodes: true,
  },
  {
    id: "213",
    difficulty: "field",
    origin: "CAIRO",
    optionCount: 12,
    title: { vi: "Biên Giới Vỡ", en: "Broken Border" },
    briefing: {
      vi: "Tín hiệu cuối cùng xuất hiện gần Cairo rồi tắt. Chỉ còn đồng hồ thiết bị, vị trí bán cầu và một mẩu tên thủ đô bị mã hóa.",
      en: "The last signal surfaced near Cairo, then went dark. Only a device clock, hemisphere data, and a ciphered capital fragment remain.",
    },
    clueKinds: ["timezone", "hemisphere", "capitalPattern", "regionLanguage"],
    hideFlags: true,
    hideCodes: true,
  },
  {
    id: "314",
    difficulty: "senior",
    origin: "RIO",
    optionCount: 14,
    title: { vi: "Bản Đồ Nửa Đêm", en: "Midnight Atlas" },
    briefing: {
      vi: "Một bản đồ bị đốt dở được tìm thấy tại Rio. Những chi tiết còn lại rời rạc và cố tình gây nhiễu.",
      en: "A half-burned map was recovered in Rio. Its surviving details are fragmented and deliberately misleading.",
    },
    clueKinds: [
      "currencySymbol",
      "subregion",
      "borders",
      "capitalPattern",
      "hemisphere",
    ],
    hideFlags: true,
    hideCodes: true,
  },
  {
    id: "509",
    difficulty: "master",
    origin: "OSLO",
    optionCount: 16,
    title: { vi: "Tiếng Vọng Cực Quang", en: "Polar Echo" },
    briefing: {
      vi: "Đường dây liên lạc tại Oslo chỉ để lại các mẫu dữ liệu gián tiếp. Không quốc kỳ, không mã quốc gia — chỉ còn suy luận.",
      en: "The Oslo relay left only indirect data patterns. No flags, no country codes — deduction is all you have.",
    },
    clueKinds: [
      "timezone",
      "languageCount",
      "currencySymbol",
      "capitalPattern",
      "subregion",
    ],
    hideFlags: true,
    hideCodes: true,
  },
  {
    id: "777",
    difficulty: "legend",
    origin: "UNKNOWN",
    optionCount: 18,
    title: { vi: "Tọa Độ Cuối", en: "The Last Coordinate" },
    briefing: {
      vi: "Không có điểm xuất phát. Không có nhân chứng. Sáu mảnh dữ liệu mâu thuẫn là tất cả những gì ngăn mục tiêu biến mất vĩnh viễn.",
      en: "No origin. No witnesses. Six conflicting data fragments are all that stand between you and a permanent disappearance.",
    },
    clueKinds: [
      "hemisphere",
      "timezone",
      "currency",
      "borders",
      "languageCount",
      "capitalPattern",
    ],
    hideFlags: true,
    hideCodes: true,
  },
];

export const difficultyLabels = {
  vi: {
    rookie: "TẬP SỰ",
    field: "HIỆN TRƯỜNG",
    senior: "CAO CẤP",
    master: "BẬC THẦY",
    legend: "HUYỀN THOẠI",
  },
  en: {
    rookie: "ROOKIE",
    field: "FIELD AGENT",
    senior: "SENIOR",
    master: "MASTER",
    legend: "LEGEND",
  },
} as const;
