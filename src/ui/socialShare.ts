import type { Locale } from '../types'

export interface AchievementCardData {
  locale: Locale
  rank: string
  reputation: number
  points: number
  badges: Array<{ icon: string; name: string }>
}

export function getPublicGameUrl(locationHref = window.location.href): string | null {
  const configured = String(import.meta.env.VITE_PUBLIC_GAME_URL ?? '').trim()
  if (configured) return configured.replace(/\/$/, '')
  try {
    const url = new URL(locationHref)
    const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0'])
    if (localHosts.has(url.hostname) || url.protocol !== 'https:') return null
    return `${url.origin}${url.pathname}`.replace(/\/$/, '')
  } catch {
    return null
  }
}

export function buildShareCaption(data: AchievementCardData, gameUrl?: string | null): string {
  const badgeText = data.badges.length
    ? data.badges.slice(0, 3).map((badge) => `${badge.icon} ${badge.name}`).join(' · ')
    : data.locale === 'vi' ? 'Đang truy tìm huy hiệu đầu tiên' : 'Hunting for the first badge'
  const message = data.locale === 'vi'
    ? `Tôi đã đạt cấp bậc ${data.rank} với ${data.reputation} danh tiếng trong Geo—Detective. ${badgeText}. Bạn có phá án nhanh hơn tôi không? #GeoDetective #DetectiveGame`
    : `I reached ${data.rank} with ${data.reputation} reputation in Geo—Detective. ${badgeText}. Can you close the case faster? #GeoDetective #DetectiveGame`
  if (!gameUrl) return message
  return `${message}\n${data.locale === 'vi' ? 'Chơi ngay' : 'Play now'}: ${gameUrl}`
}

export function createAchievementCard(data: AchievementCardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const context = canvas.getContext('2d')
    if (!context) { reject(new Error('Canvas unavailable')); return }

    context.fillStyle = '#0d0e0d'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(200,214,142,.08)'
    context.lineWidth = 2
    for (let x = 0; x <= canvas.width; x += 90) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke() }
    for (let y = 0; y <= canvas.height; y += 90) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke() }

    context.strokeStyle = '#d54a34'
    context.lineWidth = 8
    context.strokeRect(56, 56, 968, 1238)
    context.fillStyle = '#d54a34'
    context.font = '600 30px sans-serif'
    context.fillText('INTERNATIONAL GEOGRAPHIC INVESTIGATION BUREAU', 90, 125)
    context.fillStyle = '#eeeade'
    context.font = '700 82px sans-serif'
    context.fillText('GEO—DETECTIVE', 90, 235)
    context.fillStyle = '#85877f'
    context.font = '500 27px monospace'
    context.fillText(data.locale === 'vi' ? 'HỒ SƠ THÀNH TÍCH ĐÃ XÁC THỰC' : 'VERIFIED ACHIEVEMENT DOSSIER', 90, 290)

    context.fillStyle = '#c8d68e'
    context.font = '700 68px sans-serif'
    context.fillText(data.rank.toUpperCase(), 90, 470)
    context.fillStyle = '#85877f'
    context.font = '500 25px monospace'
    context.fillText(data.locale === 'vi' ? 'CẤP BẬC THÁM TỬ' : 'DETECTIVE RANK', 90, 515)

    const stats = [
      [String(data.reputation), data.locale === 'vi' ? 'DANH TIẾNG' : 'REPUTATION'],
      [String(data.points), data.locale === 'vi' ? 'ĐIỂM ĐIỀU TRA' : 'INTEL POINTS'],
      [String(data.badges.length), data.locale === 'vi' ? 'HUY HIỆU' : 'BADGES'],
    ]
    stats.forEach(([value, label], index) => {
      const x = 90 + index * 310
      context.strokeStyle = '#3f443b'
      context.lineWidth = 2
      context.strokeRect(x, 590, 275, 150)
      context.fillStyle = '#eeeade'
      context.font = '700 50px sans-serif'
      context.fillText(value, x + 25, 655)
      context.fillStyle = '#85877f'
      context.font = '500 20px monospace'
      context.fillText(label, x + 25, 705)
    })

    context.fillStyle = '#d54a34'
    context.font = '600 24px monospace'
    context.fillText(data.locale === 'vi' ? 'HUY HIỆU NỔI BẬT' : 'FEATURED BADGES', 90, 830)
    const featured = data.badges.slice(0, 3)
    if (featured.length) {
      featured.forEach((badge, index) => {
        const y = 910 + index * 105
        context.fillStyle = '#c8d68e'
        context.font = '700 44px sans-serif'
        context.fillText(badge.icon, 100, y)
        context.fillStyle = '#eeeade'
        context.font = '600 31px sans-serif'
        context.fillText(badge.name.toUpperCase(), 175, y)
      })
    } else {
      context.fillStyle = '#85877f'
      context.font = '500 27px monospace'
      context.fillText(data.locale === 'vi' ? 'HỒ SƠ ĐANG CHỜ CHIẾN CÔNG ĐẦU TIÊN' : 'AWAITING THE FIRST FIELD COMMENDATION', 90, 930)
    }
    context.fillStyle = '#85877f'
    context.font = '500 22px monospace'
    context.fillText('#GEODETECTIVE  ·  CASE STATUS: ACTIVE', 90, 1240)

    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image export failed')), 'image/png', .94)
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
