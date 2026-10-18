import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSoundEffects } from './sound'

function installAudioContext() {
  const gain = {
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }
  const oscillator = {
    type: 'sine',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(() => gain),
    start: vi.fn(),
    stop: vi.fn(),
  }
  const context = {
    state: 'suspended',
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    close: vi.fn(),
    createOscillator: vi.fn(() => ({ ...oscillator, frequency: { setValueAtTime: vi.fn() } })),
    createGain: vi.fn(() => gain),
  }
  const AudioContextMock = vi.fn(function AudioContextMock() { return context })
  vi.stubGlobal('AudioContext', AudioContextMock)
  return { AudioContextMock, context }
}

describe('investigation sound', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('waits for interaction, loops with day intensity, and stops cleanly', () => {
    const { AudioContextMock, context } = installAudioContext()
    const { result, unmount } = renderHook(() => useSoundEffects(true))
    expect(AudioContextMock).not.toHaveBeenCalled()

    act(() => result.current.unlock())
    expect(AudioContextMock).toHaveBeenCalledOnce()
    act(() => result.current.startInvestigation(3))
    const firstPulseCount = context.createOscillator.mock.calls.length
    expect(firstPulseCount).toBe(7)

    act(() => vi.advanceTimersByTime(1660))
    expect(context.createOscillator.mock.calls.length).toBe(firstPulseCount * 2)
    act(() => result.current.stopInvestigation())
    act(() => vi.advanceTimersByTime(5000))
    expect(context.createOscillator.mock.calls.length).toBe(firstPulseCount * 2)

    unmount()
    expect(context.close).toHaveBeenCalledOnce()
  })

  it('falls back silently when Web Audio is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined)
    const { result } = renderHook(() => useSoundEffects(true))
    expect(() => {
      act(() => result.current.unlock())
      act(() => result.current.startInvestigation(1))
      act(() => result.current.playClue())
    }).not.toThrow()
  })
})
