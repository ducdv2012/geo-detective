import { useCallback, useEffect, useRef } from "react";
import { appConfig } from "../../app.config";

type AudioContextConstructor = typeof AudioContext;

type ToneOptions = {
  attack?: number;
  ambient?: boolean;
  endFrequency?: number;
  type?: OscillatorType;
};

export function useSoundEffects(
  enabled: boolean,
  musicVolume: number = appConfig.audio.defaultMusicVolume,
) {
  const contextRef = useRef<AudioContext | null>(null);
  const soundtrackTimerRef = useRef<number | null>(null);
  const soundtrackDayRef = useRef(1);
  const soundtrackBarRef = useRef(0);
  const soundtrackSourcesRef = useRef(new Set<AudioScheduledSourceNode>());

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: AudioContextConstructor;
        }
      ).webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      contextRef.current ??= new AudioCtor();
      if (contextRef.current.state === "suspended")
        void contextRef.current.resume();
      return contextRef.current;
    } catch {
      return null;
    }
  }, []);

  const trackSource = useCallback(
    (source: AudioScheduledSourceNode, ambient: boolean) => {
      if (!ambient) return;
      soundtrackSourcesRef.current.add(source);
      source.onended = () => soundtrackSourcesRef.current.delete(source);
    },
    [],
  );

  const tone = useCallback(
    (
      frequency: number,
      start: number,
      duration: number,
      gain = 0.045,
      options: ToneOptions = {},
    ) => {
      if (!enabled) return;
      const context = ensureContext();
      if (!context) return;
      const {
        attack = 0.015,
        ambient = false,
        endFrequency,
        type = "sine",
      } = options;
      const effectiveGain = ambient
        ? gain *
          appConfig.audio.musicGainMultiplier *
          Math.min(
            appConfig.audio.maximumVolume,
            Math.max(appConfig.audio.minimumVolume, musicVolume),
          )
        : gain;
      const beginsAt = context.currentTime + start;
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, beginsAt);
      if (endFrequency)
        oscillator.frequency.exponentialRampToValueAtTime(
          endFrequency,
          beginsAt + duration,
        );
      volume.gain.setValueAtTime(0.0001, beginsAt);
      volume.gain.linearRampToValueAtTime(
        effectiveGain,
        beginsAt + Math.min(attack, duration * 0.45),
      );
      volume.gain.exponentialRampToValueAtTime(0.0001, beginsAt + duration);
      oscillator.connect(volume).connect(context.destination);
      trackSource(oscillator, ambient);
      oscillator.start(beginsAt);
      oscillator.stop(beginsAt + duration);
    },
    [enabled, ensureContext, musicVolume, trackSource],
  );

  const noiseBurst = useCallback(
    (
      start: number,
      duration: number,
      gain: number,
      filterFrequency: number,
      ambient = false,
    ) => {
      if (!enabled) return;
      const context = ensureContext();
      if (!context) return;
      const beginsAt = context.currentTime + start;
      const effectiveGain = ambient
        ? gain *
          appConfig.audio.musicGainMultiplier *
          Math.min(
            appConfig.audio.maximumVolume,
            Math.max(appConfig.audio.minimumVolume, musicVolume),
          )
        : gain;
      const frameCount = Math.max(1, Math.ceil(context.sampleRate * duration));
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1)
        channel[index] = Math.random() * 2 - 1;

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const volume = context.createGain();
      source.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.setValueAtTime(filterFrequency, beginsAt);
      volume.gain.setValueAtTime(effectiveGain, beginsAt);
      volume.gain.exponentialRampToValueAtTime(0.0001, beginsAt + duration);
      source.connect(filter).connect(volume).connect(context.destination);
      trackSource(source, ambient);
      source.start(beginsAt);
      source.stop(beginsAt + duration);
    },
    [enabled, ensureContext, musicVolume, trackSource],
  );

  const stopInvestigation = useCallback(() => {
    if (soundtrackTimerRef.current !== null)
      window.clearInterval(soundtrackTimerRef.current);
    soundtrackTimerRef.current = null;
    soundtrackSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* The sound has already ended. */
      }
    });
    soundtrackSourcesRef.current.clear();
    soundtrackBarRef.current = 0;
  }, []);

  const investigationBar = useCallback(() => {
    const day = soundtrackDayRef.current;
    const barDuration = 5.6 - day * 0.4;
    const beat = barDuration / 8;
    const progression = [
      { root: 73.42, minor: true },
      { root: 58.27, minor: false },
      { root: 65.41, minor: true },
      { root: 55, minor: false },
    ];
    const harmony = progression[soundtrackBarRef.current % progression.length];
    soundtrackBarRef.current += 1;
    const thirdRatio = harmony.minor ? 1.1892 : 1.2599;

    // Sustained noir harmony replaces the old repeating lead melody.
    [harmony.root, harmony.root * 1.5, harmony.root * 2 * thirdRatio].forEach(
      (frequency, index) => {
        tone(frequency, 0, barDuration + 0.12, 0.008 + day * 0.0015, {
          ambient: true,
          attack: 0.42,
          type: index === 0 ? "triangle" : "sawtooth",
        });
      },
    );

    // A real bass line anchors the score without competing with the clues.
    const bassPattern = [1, 1, 1.5, 1, 1, 1.5, thirdRatio, 1.5];
    bassPattern.forEach((ratio, index) => {
      if (index % 2 !== 0 && day === 1) return;
      tone(
        harmony.root * ratio,
        index * beat,
        beat * 0.72,
        0.024 + day * 0.0025,
        {
          ambient: true,
          attack: 0.025,
          type: "triangle",
        },
      );
    });

    // Kick, snare and hi-hat turn the ambience into a complete soundtrack.
    [0, 4, ...(day >= 2 ? [6] : [])].forEach((step) => {
      tone(105, step * beat, 0.22, 0.055 + day * 0.004, {
        ambient: true,
        endFrequency: 42,
        type: "sine",
      });
    });
    [2, 6].forEach((step) => {
      noiseBurst(step * beat, 0.16, 0.018 + day * 0.002, 900, true);
      tone(175, step * beat, 0.12, 0.015, {
        ambient: true,
        endFrequency: 95,
        type: "triangle",
      });
    });
    Array.from({ length: day === 3 ? 16 : 8 }, (_, index) => index).forEach(
      (step) => {
        const subdivision = day === 3 ? beat / 2 : beat;
        noiseBurst(
          step * subdivision,
          0.045,
          step % 2 ? 0.0035 : 0.005,
          4800,
          true,
        );
      },
    );

    // Restrained radio pulses increase the pressure on later days.
    if (day >= 2) {
      [1, 3, 5, 7].forEach((step) => {
        tone(720 + day * 80, step * beat, 0.055, 0.006 + day * 0.001, {
          ambient: true,
          type: "square",
        });
      });
    }
  }, [noiseBurst, tone]);

  const startInvestigation = useCallback(
    (day: number) => {
      const normalizedDay = Math.min(
        appConfig.gameplay.maxDays,
        Math.max(1, day),
      );
      if (
        enabled &&
        soundtrackTimerRef.current !== null &&
        soundtrackDayRef.current === normalizedDay
      )
        return;
      stopInvestigation();
      if (!enabled || !ensureContext()) return;
      soundtrackDayRef.current = normalizedDay;
      soundtrackBarRef.current = 0;
      investigationBar();
      const barMilliseconds = (5.6 - normalizedDay * 0.4) * 1000;
      soundtrackTimerRef.current = window.setInterval(
        investigationBar,
        barMilliseconds,
      );
    },
    [enabled, ensureContext, investigationBar, stopInvestigation],
  );

  const unlock = useCallback(() => {
    void ensureContext();
  }, [ensureContext]);
  const playSoundCheck = useCallback(
    (level = musicVolume) => {
      const context = ensureContext();
      if (!context) return;
      const previewGain =
        0.055 *
        Math.min(
          appConfig.audio.maximumVolume,
          Math.max(appConfig.audio.minimumVolume, level),
        );
      [196, 293.66, 392].forEach((frequency, index) => {
        const beginsAt = context.currentTime + index * 0.09;
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = index === 0 ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, beginsAt);
        volume.gain.setValueAtTime(0.0001, beginsAt);
        volume.gain.linearRampToValueAtTime(previewGain, beginsAt + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.0001, beginsAt + 0.32);
        oscillator.connect(volume).connect(context.destination);
        oscillator.start(beginsAt);
        oscillator.stop(beginsAt + 0.34);
      });
    },
    [ensureContext, musicVolume],
  );
  const playCapture = useCallback(() => {
    stopInvestigation();
    tone(420, 0, 0.16, 0.035, { type: "square" });
    tone(620, 0.18, 0.22, 0.04, { type: "square" });
    tone(110, 0.48, 0.35, 0.07, { type: "triangle" });
  }, [stopInvestigation, tone]);
  const playEscape = useCallback(() => {
    stopInvestigation();
    tone(360, 0, 0.32, 0.04, { type: "sawtooth" });
    tone(260, 0.22, 0.4, 0.045, { type: "sawtooth" });
    tone(150, 0.55, 0.5, 0.035, { type: "triangle" });
  }, [stopInvestigation, tone]);

  const playClue = useCallback(() => {
    tone(520, 0, 0.08, 0.02, { type: "square" });
    tone(780, 0.09, 0.16, 0.018);
  }, [tone]);

  useEffect(
    () => () => {
      stopInvestigation();
      void contextRef.current?.close();
    },
    [stopInvestigation],
  );

  return {
    unlock,
    playSoundCheck,
    startInvestigation,
    stopInvestigation,
    playCapture,
    playEscape,
    playClue,
  };
}
