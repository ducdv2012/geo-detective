import { useEffect, useRef } from 'react'
import type { Locale } from '../types'

export type CinematicKind = 'capture' | 'escape'

interface Props {
  kind: CinematicKind
  final: boolean
  locale: Locale
  country: string
  onComplete: () => void
}

export function OutcomeCinematic({ kind, final, locale, country, onComplete }: Props) {
  const completed = useRef(false)
  const skipRef = useRef<HTMLButtonElement>(null)
  const finish = () => {
    if (completed.current) return
    completed.current = true
    onComplete()
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    skipRef.current?.focus()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 300 : kind === 'escape' && !final ? 1400 : 2400
    const timer = window.setTimeout(finish, duration)
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish() }
    document.addEventListener('keydown', handleKey)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
    // The cinematic's inputs are fixed for the lifetime of this mounted scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copy = locale === 'vi'
    ? kind === 'capture'
      ? { signal: 'MỤC TIÊU ĐÃ KHÓA', title: 'BẮT GIỮ THÀNH CÔNG', body: `Đội hiện trường đã khống chế đối tượng tại ${country}.`, skip: 'BỎ QUA' }
      : { signal: final ? 'MẤT TÍN HIỆU' : 'MỤC TIÊU ĐANG DI CHUYỂN', title: final ? 'ĐỐI TƯỢNG ĐÃ TRỐN THOÁT' : 'MỤC TIÊU ĐÃ ĐỔI VỊ TRÍ', body: final ? `Dấu vết cuối cùng biến mất tại ${country}.` : `Đối tượng vừa rời ${country}. Đang mở hồ sơ ngày mới.`, skip: 'BỎ QUA' }
    : kind === 'capture'
      ? { signal: 'TARGET LOCKED', title: 'ARREST SUCCESSFUL', body: `Field agents secured the target in ${country}.`, skip: 'SKIP' }
      : { signal: final ? 'SIGNAL LOST' : 'TARGET IN TRANSIT', title: final ? 'TARGET ESCAPED' : 'TARGET RELOCATED', body: final ? `The last trace vanished in ${country}.` : `The target fled ${country}. Opening the next daily file.`, skip: 'SKIP' }

  return (
    <div className={`cinematic-overlay ${kind}`} role="status" aria-live="assertive">
      <div className="cinematic-grid" aria-hidden="true"/>
      <div className="cinematic-radar" aria-hidden="true"><i/><i/><span/></div>
      <div className="cinematic-silhouette" aria-hidden="true"><i/><b/></div>
      <div className="cinematic-copy">
        <small>{copy.signal}</small><h2>{copy.title}</h2><p>{copy.body}</p>
      </div>
      <div className="cinematic-stamp" aria-hidden="true">{kind === 'capture' ? 'TARGET SECURED' : 'SIGNAL LOST'}</div>
      <button ref={skipRef} className="cinematic-skip" onClick={finish}>{copy.skip} →</button>
    </div>
  )
}
