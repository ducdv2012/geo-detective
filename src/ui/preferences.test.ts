import { describe, expect, it, vi } from "vitest";
import {
  defaultUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  UI_PREFERENCES_KEY,
} from "./preferences";

describe("UI preferences", () => {
  it("shows onboarding once and enables sound by default", () => {
    expect(loadUiPreferences({ getItem: () => null })).toEqual(
      defaultUiPreferences,
    );
  });

  it("sanitizes partial and invalid stored values", () => {
    expect(
      loadUiPreferences({
        getItem: () => JSON.stringify({ hasSeenOnboarding: true }),
      }),
    ).toEqual({ hasSeenOnboarding: true, soundEnabled: true });
    expect(loadUiPreferences({ getItem: () => "{broken" })).toEqual(
      defaultUiPreferences,
    );
  });

  it("stores UI choices separately from campaign progress", () => {
    const setItem = vi.fn();
    saveUiPreferences(
      { setItem },
      { hasSeenOnboarding: true, soundEnabled: false },
    );
    expect(setItem).toHaveBeenCalledWith(
      UI_PREFERENCES_KEY,
      JSON.stringify({ hasSeenOnboarding: true, soundEnabled: false }),
    );
  });
});
