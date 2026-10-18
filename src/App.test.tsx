import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { UI_PREFERENCES_KEY } from "./ui/preferences";

vi.mock("./services/countries", () => ({
  loadCountries: async () => {
    const { fallbackCountries } = await import("./data/fallbackCountries");
    return { countries: fallbackCountries, source: "fallback" as const };
  },
}));

vi.mock("./services/weather", () => ({
  fetchWeather: async () => ({
    available: false,
    temperature: null,
    weatherCode: null,
    precipitation: null,
  }),
}));

describe("App onboarding and evidence focus", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens onboarding on the first visit and stores completion separately", async () => {
    render(<App />);
    expect(
      screen.getByRole("dialog", { name: "CHỌN HỒ SƠ" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /bỏ qua/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(UI_PREFERENCES_KEY) ?? "{}"),
    ).toMatchObject({ hasSeenOnboarding: true });
  });

  it("focuses the clue heading after opening a dossier, never the search field", async () => {
    localStorage.setItem(
      UI_PREFERENCES_KEY,
      JSON.stringify({ hasSeenOnboarding: true, soundEnabled: false }),
    );
    render(<App />);
    const start = await screen.findByRole("button", {
      name: /mở hồ sơ điều tra/i,
    });
    await waitFor(() => expect(start).toBeEnabled());
    fireEvent.click(start);

    const evidence = await screen.findByRole("heading", {
      name: "BẢNG MANH MỐI",
    });
    await waitFor(() => expect(document.activeElement).toBe(evidence));
    expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
    expect(evidence.scrollIntoView).toHaveBeenCalled();
  });

  it("persists the background music volume", () => {
    localStorage.setItem(
      UI_PREFERENCES_KEY,
      JSON.stringify({ hasSeenOnboarding: true, soundEnabled: false }),
    );
    render(<App />);
    const slider = screen.getByRole("slider", { name: "Âm lượng nhạc nền" });
    expect(slider).toHaveValue("0.7");
    fireEvent.change(slider, { target: { value: "0.25" } });
    expect(slider).toHaveValue("0.25");
    expect(
      JSON.parse(localStorage.getItem(UI_PREFERENCES_KEY) ?? "{}"),
    ).toMatchObject({ musicVolume: 0.25, soundEnabled: true });
  });
});
