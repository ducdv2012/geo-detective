import { useCallback, useEffect, useRef } from 'react'

type AudioContextConstructor = typeof AudioContext

export function useSoundEffects(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null)
  const ambientTimerRef = useRef<number | null>(null)
  const ambientDayRef = useRef(1)
  const ambientOscillatorsRef = useRef(new Set<OscillatorNode>())

  const ensureContext = useCallback(() => {
    if (typeof window === 'undefined') return null
    const AudioCtor = (window.AudioContext || (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext)
    if (!AudioCtor) return null
    try {
      contextRef.current ??= new AudioCtor()
      if (contextRef.current.state === 'suspended') void contextRef.current.resume()
      return contextRef.current
    } catch {
      return null
    }
  }, [])

  const tone = useCallback((
    frequency: number,
    start: number,
    duration: number,
    gain = .045,
    type: OscillatorType = 'sine',
    ambient = false,
  ) => {
    if (!enabled) return
    const context = ensureContext()
    if (!context) return
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + start)
    volume.gain.setValueAtTime(0, context.currentTime + start)
    volume.gain.linearRampToValueAtTime(gain, context.currentTime + start + .015)
    volume.gain.exponentialRampToValueAtTime(.0001, context.currentTime + start + duration)
    oscillator.connect(volume).connect(context.destination)
    if (ambient) {
      ambientOscillatorsRef.current.add(oscillator)
      oscillator.onended = () => ambientOscillatorsRef.current.delete(oscillator)
    }
    oscillator.start(context.currentTime + start)
    oscillator.stop(context.currentTime + start + duration)
  }, [enabled, ensureContext])

  const stopInvestigation = useCallback(() => {
    if (ambientTimerRef.current !== null) window.clearInterval(ambientTimerRef.current)
    ambientTimerRef.current = null
    ambientOscillatorsRef.current.forEach((oscillator) => {
      try { oscillator.stop() } catch { /* The note has already ended. */ }
    })
    ambientOscillatorsRef.current.clear()
  }, [])

  const investigationPulse = useCallback(() => {
    const day = ambientDayRef.current
    const base = 52 + day * 7
    const tension = .022 + day * .003
    // Low continuous bed, a four-note noir motif, and a short radar accent.
    tone(base, 0, 1.9, tension, 'triangle', true)
    tone(base * 1.5, .12, .42, .014 + day * .002, 'sine', true)
    tone(base * 1.78, .52, .38, .013 + day * .002, 'sine', true)
    tone(base * 1.5, .92, .36, .014 + day * .002, 'sine', true)
    tone(base * 2.12, 1.28, .28, .012 + day * .002, 'square', true)
    tone(470 + day * 65, .22, .12, .016 + day * .002, 'square', true)
    if (day >= 2) tone(165 + day * 22, 1.48, .25, .012, 'sawtooth', true)
  }, [tone])

  const startInvestigation = useCallback((day: number) => {
    const normalizedDay = Math.min(3, Math.max(1, day))
    if (enabled && ambientTimerRef.current !== null && ambientDayRef.current === normalizedDay) return
    stopInvestigation()
    if (!enabled || !ensureContext()) return
    ambientDayRef.current = normalizedDay
    investigationPulse()
    const interval = 2200 - ambientDayRef.current * 180
    ambientTimerRef.current = window.setInterval(investigationPulse, interval)
  }, [enabled, ensureContext, investigationPulse, stopInvestigation])

  const unlock = useCallback(() => { void ensureContext() }, [ensureContext])
  const playCapture = useCallback(() => {
    stopInvestigation()
    tone(420, 0, .16, .035, 'square')
    tone(620, .18, .22, .04, 'square')
    tone(110, .48, .35, .07, 'triangle')
  }, [stopInvestigation, tone])
  const playEscape = useCallback(() => {
    stopInvestigation()
    tone(360, 0, .32, .04, 'sawtooth')
    tone(260, .22, .4, .045, 'sawtooth')
    tone(150, .55, .5, .035, 'triangle')
  }, [stopInvestigation, tone])

  const playClue = useCallback(() => {
    tone(520, 0, .08, .02, 'square')
    tone(780, .09, .16, .018, 'sine')
  }, [tone])

  useEffect(() => () => {
    stopInvestigation()
    void contextRef.current?.close()
  }, [stopInvestigation])

  return { unlock, startInvestigation, stopInvestigation, playCapture, playEscape, playClue }
}
