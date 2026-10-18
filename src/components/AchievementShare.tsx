import { useEffect, useMemo, useRef, useState } from 'react'
import { badgeCatalog } from '../game/achievements'
import type { Locale, PlayerProgress } from '../types'
import { buildShareCaption, createAchievementCard, downloadBlob, getPublicGameUrl } from '../ui/socialShare'

interface Props {
  locale: Locale
  progress: PlayerProgress
  rank: string
  gameUrl?: string
  onClose: () => void
}

export function AchievementShare({ locale, progress, rank, gameUrl, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('')
  const labels = locale === 'vi' ? {
    eyebrow: 'HỒ SƠ THÀNH TÍCH', title: 'KHOE CHIẾN CÔNG', body: 'Chia sẻ cấp bậc, danh tiếng và những huy hiệu nổi bật của bạn.',
    native: 'CHIA SẺ LÊN ỨNG DỤNG', facebook: 'FACEBOOK', tiktok: 'TẢI ẢNH CHO TIKTOK', copy: 'SAO CHÉP CAPTION', close: 'ĐÓNG',
    shared: 'Đã mở bảng chia sẻ.', copied: 'Đã sao chép caption.', downloaded: 'Đã tải thẻ thành tích.', facebookReady: 'Caption và link chơi đã được sao chép. Hãy dán vào bài viết Facebook.',
    noPublicUrl: 'Game đang chạy cục bộ nên Facebook không thể mở link chơi. Hãy cấu hình URL công khai trước khi chia sẻ.', failed: 'Không thể tạo thẻ. Hãy thử lại.',
    rep: 'DANH TIẾNG', points: 'ĐIỂM', badges: 'HUY HIỆU', featured: 'HUY HIỆU NỔI BẬT', empty: 'Chưa có huy hiệu',
  } : {
    eyebrow: 'ACHIEVEMENT DOSSIER', title: 'SHARE YOUR RECORD', body: 'Share your rank, reputation, and featured commendations.',
    native: 'SHARE TO APPS', facebook: 'FACEBOOK', tiktok: 'DOWNLOAD FOR TIKTOK', copy: 'COPY CAPTION', close: 'CLOSE',
    shared: 'Share sheet opened.', copied: 'Caption copied.', downloaded: 'Achievement card downloaded.', facebookReady: 'Caption and game link copied. Paste them into your Facebook post.',
    noPublicUrl: 'The game is running locally, so Facebook cannot open its link. Configure a public URL before sharing.', failed: 'Could not create the card. Try again.',
    rep: 'REPUTATION', points: 'POINTS', badges: 'BADGES', featured: 'FEATURED BADGES', empty: 'No badges yet',
  }
  const badges = useMemo(() => progress.earnedBadges.map((id) => ({
    icon: badgeCatalog[id].icon,
    name: badgeCatalog[id].name[locale],
  })), [locale, progress.earnedBadges])
  const cardData = { locale, rank, reputation: progress.reputation, points: progress.pointBalance, badges }
  const publicGameUrl = gameUrl ?? getPublicGameUrl()
  const caption = buildShareCaption(cardData, publicGameUrl)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)')]
      if (!items.length) return
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [onClose])

  const copyCaption = async () => {
    try { await navigator.clipboard.writeText(caption); setStatus(labels.copied) } catch { setStatus(labels.failed) }
  }

  const shareNative = async () => {
    try {
      const blob = await createAchievementCard(cardData)
      const file = new File([blob], 'geo-detective-achievement.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Geo—Detective', text: caption, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: 'Geo—Detective', text: caption, ...(publicGameUrl ? { url: publicGameUrl } : {}) })
      } else {
        await copyCaption()
        return
      }
      setStatus(labels.shared)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus(labels.failed)
    }
  }

  const shareFacebook = () => {
    if (!publicGameUrl) { setStatus(labels.noPublicUrl); return }
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicGameUrl)}&quote=${encodeURIComponent(caption)}`
    window.open(url, 'geo-detective-facebook', 'popup,width=720,height=620,noopener,noreferrer')
    void navigator.clipboard?.writeText(caption)
    setStatus(labels.facebookReady)
  }

  const downloadForTikTok = async () => {
    try {
      downloadBlob(await createAchievementCard(cardData), 'geo-detective-achievement.png')
      await navigator.clipboard?.writeText(caption)
      setStatus(labels.downloaded)
    } catch { setStatus(labels.failed) }
  }

  return (
    <div className="share-overlay">
      <div className="share-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button className="share-close" onClick={onClose} aria-label={labels.close}>×</button>
        <section className="share-card-preview" aria-label={labels.eyebrow}>
          <small>INTERNATIONAL GEOGRAPHIC INVESTIGATION BUREAU</small>
          <h3>GEO—DETECTIVE</h3>
          <div className="share-rank"><span>{locale === 'vi' ? 'CẤP BẬC' : 'RANK'}</span><strong>{rank}</strong></div>
          <div className="share-stats">
            <div><strong>{progress.reputation}</strong><span>{labels.rep}</span></div>
            <div><strong>{progress.pointBalance}</strong><span>{labels.points}</span></div>
            <div><strong>{badges.length}</strong><span>{labels.badges}</span></div>
          </div>
          <small>{labels.featured}</small>
          <div className="share-badges">{badges.length ? badges.slice(0, 3).map((badge) => <span key={badge.name}><b>{badge.icon}</b>{badge.name}</span>) : <i>{labels.empty}</i>}</div>
          <footer>#GEODETECTIVE <span>CASE STATUS: ACTIVE</span></footer>
        </section>
        <section className="share-controls">
          <span className="kicker">◢ {labels.eyebrow}</span>
          <h2 id="share-title">{labels.title}</h2>
          <p>{labels.body}</p>
          <div className="share-actions">
            <button className="primary-button" onClick={shareNative}><span>{labels.native}</span><b>↗</b></button>
            <button className="social-button facebook-button" onClick={shareFacebook}><b aria-hidden="true">f</b>{labels.facebook}</button>
            <button className="social-button tiktok-button" onClick={downloadForTikTok}><b aria-hidden="true">♪</b>{labels.tiktok}</button>
            <button className="secondary-button" onClick={copyCaption}>{labels.copy}</button>
          </div>
          {status && <p className="share-status" role="status">✓ {status}</p>}
          {!publicGameUrl && <p className="share-url-warning">! {labels.noPublicUrl}</p>}
          <small className="share-note">{locale === 'vi' ? 'Trên điện thoại, “Chia sẻ lên ứng dụng” cho phép chọn TikTok, Facebook và các ứng dụng đã cài.' : 'On mobile, “Share to apps” lets you choose TikTok, Facebook, and other installed apps.'}</small>
        </section>
      </div>
    </div>
  )
}
