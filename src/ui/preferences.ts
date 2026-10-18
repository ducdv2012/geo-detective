import { appConfig } from "../../app.config";

export const UI_PREFERENCES_KEY: string = appConfig.storage.uiPreferences;

export interface UiPreferences {
  hasSeenOnboarding: boolean;
  soundEnabled: boolean;
  musicVolume: number;
}

export const defaultUiPreferences: UiPreferences = {
  hasSeenOnboarding: false,
  soundEnabled: appConfig.audio.enabledByDefault,
  musicVolume: appConfig.audio.defaultMusicVolume,
};

function sanitizeVolume(value: unknown): number {
  const volume = Number(value);
  if (!Number.isFinite(volume)) return appConfig.audio.defaultMusicVolume;
  return Math.min(
    appConfig.audio.maximumVolume,
    Math.max(appConfig.audio.minimumVolume, volume),
  );
}

export function loadUiPreferences(
  storage: Pick<Storage, "getItem">,
): UiPreferences {
  try {
    const parsed = JSON.parse(
      storage.getItem(UI_PREFERENCES_KEY) ?? "null",
    ) as Partial<UiPreferences> | null;
    if (!parsed || typeof parsed !== "object") return defaultUiPreferences;
    return {
      hasSeenOnboarding: parsed.hasSeenOnboarding === true,
      soundEnabled: parsed.soundEnabled !== false,
      musicVolume: sanitizeVolume(parsed.musicVolume),
    };
  } catch {
    return defaultUiPreferences;
  }
}

export function saveUiPreferences(
  storage: Pick<Storage, "setItem">,
  preferences: UiPreferences,
) {
  try {
    storage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // UI preferences are optional; the game remains playable without storage.
  }
}
