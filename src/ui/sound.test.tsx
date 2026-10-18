import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSoundEffects } from "./sound";

function installAudioContext() {
  const audioParam = () => ({
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const gain = {
    gain: audioParam(),
    connect: vi.fn(),
  };
  const oscillator = {
    type: "sine",
    frequency: audioParam(),
    connect: vi.fn(() => gain),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const filter = {
    type: "highpass",
    frequency: audioParam(),
    connect: vi.fn(() => gain),
  };
  const bufferSource = {
    buffer: null,
    connect: vi.fn(() => filter),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const context = {
    state: "suspended",
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    resume: vi.fn(),
    close: vi.fn(),
    createOscillator: vi.fn(() => ({ ...oscillator, frequency: audioParam() })),
    createGain: vi.fn(() => gain),
    createBuffer: vi.fn((_channels: number, frameCount: number) => ({
      getChannelData: vi.fn(() => new Float32Array(frameCount)),
    })),
    createBufferSource: vi.fn(() => ({
      ...bufferSource,
      connect: vi.fn(() => filter),
    })),
    createBiquadFilter: vi.fn(() => filter),
  };
  const AudioContextMock = vi.fn(function AudioContextMock() {
    return context;
  });
  vi.stubGlobal("AudioContext", AudioContextMock);
  return { AudioContextMock, context };
}

describe("investigation sound", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("waits for interaction, loops with day intensity, and stops cleanly", () => {
    const { AudioContextMock, context } = installAudioContext();
    const { result, unmount } = renderHook(() => useSoundEffects(true));
    expect(AudioContextMock).not.toHaveBeenCalled();

    act(() => result.current.unlock());
    expect(AudioContextMock).toHaveBeenCalledOnce();
    act(() => result.current.startInvestigation(3));
    const firstBarOscillatorCount = context.createOscillator.mock.calls.length;
    const firstBarDrumCount = context.createBufferSource.mock.calls.length;
    expect(firstBarOscillatorCount).toBeGreaterThan(10);
    expect(firstBarDrumCount).toBeGreaterThan(10);

    act(() => vi.advanceTimersByTime(4400));
    expect(context.createOscillator.mock.calls.length).toBe(
      firstBarOscillatorCount * 2,
    );
    expect(context.createBufferSource.mock.calls.length).toBe(
      firstBarDrumCount * 2,
    );
    act(() => result.current.stopInvestigation());
    act(() => vi.advanceTimersByTime(5000));
    expect(context.createOscillator.mock.calls.length).toBe(
      firstBarOscillatorCount * 2,
    );

    unmount();
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("falls back silently when Web Audio is unavailable", () => {
    vi.stubGlobal("AudioContext", undefined);
    const { result } = renderHook(() => useSoundEffects(true));
    expect(() => {
      act(() => result.current.unlock());
      act(() => result.current.startInvestigation(1));
      act(() => result.current.playClue());
    }).not.toThrow();
  });

  it("plays an audible sound check while enabling previously muted audio", () => {
    const { AudioContextMock, context } = installAudioContext();
    const { result } = renderHook(() => useSoundEffects(false, 0.5));
    act(() => result.current.playSoundCheck(0.5));
    expect(AudioContextMock).toHaveBeenCalledOnce();
    expect(context.createOscillator).toHaveBeenCalledTimes(3);
  });
});
