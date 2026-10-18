import { useCallback, useEffect, useRef } from 'react'

type AudioContextConstructor = typeof AudioContext

export function useSoundEffects(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return null
    const AudioCtor = (window.AudioContext || (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext)
    if (!AudioCtor) return null
    try {
      contextRef.current ??= new AudioCtor()
      if (contextRef.current.state === 'suspended') void contextRef.current.resume()
      return contextRef.current
    } catch {
      return null
    }
  }, [enabled])

  const tone = useCallback((frequency: number, start: number, duration: number, gain = .045, type: OscillatorType = 'sine') => {
    const context = getContext()
    if (!context) return
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + start)
    volume.gain.setValueAtTime(0, context.currentTime + start)
    volume.gain.linearRampToValueAtTime(gain, context.currentTime + start + .015)
    volume.gain.exponentialRampToValueAtTime(.0001, context.currentTime + start + duration)
    oscillator.connect(volume).connect(context.destination)
    oscillator.start(context.currentTime + start)
    oscillator.stop(context.currentTime + start + duration)
  }, [getContext])

  const unlock = useCallback(() => { void getContext() }, [getContext])
  const playCapture = useCallback(() => {
    tone(420, 0, .16, .035, 'square')
    tone(620, .18, .22, .04, 'square')
    tone(110, .48, .35, .07, 'triangle')
  }, [tone])
  const playEscape = useCallback(() => {
    tone(360, 0, .32, .04, 'sawtooth')
    tone(260, .22, .4, .045, 'sawtooth')
    tone(150, .55, .5, .035, 'triangle')
  }, [tone])

  useEffect(() => () => { void contextRef.current?.close() }, [])

  return { unlock, playCapture, playEscape }
}
