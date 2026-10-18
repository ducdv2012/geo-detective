export const UI_PREFERENCES_KEY = 'geo-detective:ui:v1'

export interface UiPreferences {
  hasSeenOnboarding: boolean
  soundEnabled: boolean
}

export const defaultUiPreferences: UiPreferences = {
  hasSeenOnboarding: false,
  soundEnabled: true,
}

export function loadUiPreferences(storage: Pick<Storage, 'getItem'>): UiPreferences {
  try {
    const parsed = JSON.parse(storage.getItem(UI_PREFERENCES_KEY) ?? 'null') as Partial<UiPreferences> | null
    if (!parsed || typeof parsed !== 'object') return defaultUiPreferences
    return {
      hasSeenOnboarding: parsed.hasSeenOnboarding === true,
      soundEnabled: parsed.soundEnabled !== false,
    }
  } catch {
    return defaultUiPreferences
  }
}

export function saveUiPreferences(storage: Pick<Storage, 'setItem'>, preferences: UiPreferences) {
  try {
    storage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch {
    // UI preferences are optional; the game remains playable without storage.
  }
}
