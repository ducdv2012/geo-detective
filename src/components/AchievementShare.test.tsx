import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInitialProgress } from '../game/progress'
import { AchievementShare } from './AchievementShare'

afterEach(cleanup)

describe('AchievementShare', () => {
  it('previews career data and opens the Facebook share composer', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const progress = {
      ...createInitialProgress(), pointBalance: 450, reputation: 120,
      earnedBadges: ['eagleEye', 'pureDeduction'] as const,
    }
    render(<AchievementShare locale="vi" progress={{ ...progress, earnedBadges: [...progress.earnedBadges] }} rank="Điều tra viên" gameUrl="https://geo-detective.example" onClose={() => undefined} />)

    expect(screen.getByText('Điều tra viên')).toBeInTheDocument()
    expect(screen.getByText('Mắt Đại Bàng')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /facebook/i }))
    expect(open).toHaveBeenCalledWith(expect.stringContaining('facebook.com/sharer/sharer.php'), expect.any(String), expect.any(String))
    expect(open.mock.calls[0][0]).toContain(encodeURIComponent('https://geo-detective.example'))
    open.mockRestore()
  })

  it('closes with Escape and traps focus', () => {
    const close = vi.fn()
    render(<AchievementShare locale="en" progress={createInitialProgress()} rank="Trainee" onClose={close} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledOnce()
  })

  it('does not open an unusable Facebook composer for a localhost game', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<AchievementShare locale="vi" progress={createInitialProgress()} rank="Tập sự" onClose={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: /facebook/i }))
    expect(open).not.toHaveBeenCalled()
    expect(screen.getAllByText(/game đang chạy cục bộ/i).length).toBeGreaterThan(0)
    open.mockRestore()
  })
})
