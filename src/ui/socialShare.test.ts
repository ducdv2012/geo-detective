import { describe, expect, it } from 'vitest'
import { buildShareCaption } from './socialShare'

describe('social achievement caption', () => {
  it('includes rank, reputation, badges and campaign hashtags in Vietnamese', () => {
    const caption = buildShareCaption({
      locale: 'vi', rank: 'Thám tử cao cấp', reputation: 640, points: 375,
      badges: [{ icon: '◉', name: 'Mắt Đại Bàng' }],
    })
    expect(caption).toContain('Thám tử cao cấp')
    expect(caption).toContain('640 danh tiếng')
    expect(caption).toContain('Mắt Đại Bàng')
    expect(caption).toContain('#GeoDetective')
  })

  it('has a meaningful fallback before the first badge', () => {
    expect(buildShareCaption({ locale: 'en', rank: 'Trainee', reputation: 0, points: 0, badges: [] }))
      .toContain('Hunting for the first badge')
  })

  it('adds the playable public URL to the post', () => {
    const caption = buildShareCaption(
      { locale: 'vi', rank: 'Tập sự', reputation: 20, points: 100, badges: [] },
      'https://geo-detective.example',
    )
    expect(caption).toContain('Chơi ngay: https://geo-detective.example')
  })
})
