import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Onboarding } from './Onboarding'

afterEach(cleanup)

describe('Onboarding', () => {
  it('explains all four steps and can switch language without losing the step', () => {
    const toggle = vi.fn()
    const close = vi.fn()
    const view = render(<Onboarding locale="vi" onToggleLocale={toggle} onClose={close} />)

    expect(screen.getByRole('heading', { name: 'CHỌN HỒ SƠ' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục/i }))
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục/i }))
    expect(screen.getByRole('heading', { name: 'KHOANH VÙNG MỤC TIÊU' })).toBeInTheDocument()

    view.rerender(<Onboarding locale="en" onToggleLocale={toggle} onClose={close} />)
    expect(screen.getByRole('heading', { name: 'NARROW THE TARGET' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'VI' }))
    expect(toggle).toHaveBeenCalledOnce()
  })

  it('traps keyboard focus and closes with Escape', () => {
    const close = vi.fn()
    render(<Onboarding locale="vi" onToggleLocale={() => undefined} onClose={close} />)
    const buttons = screen.getAllByRole('button').filter((button) => !button.hasAttribute('disabled'))
    buttons.at(-1)?.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(buttons[0])
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledOnce()
  })
})
