import { describe, expect, it } from "vitest";
import { fallbackCountries } from "../data/fallbackCountries";
import type { CaseRound } from "../types";
import { gameReducer, initialGameState } from "./reducer";

const round = (day: number, targetIndex = 0): CaseRound => ({
  day,
  target: fallbackCountries[targetIndex],
  options: fallbackCountries.slice(0, 8),
  clues: [],
  weather: null,
});

describe("gameReducer", () => {
  it("wins immediately on the correct country", () => {
    const started = gameReducer(initialGameState, {
      type: "START",
      round: round(1),
    });
    expect(
      gameReducer(started, { type: "SUBMIT", countryCode: "VNM" }).status,
    ).toBe("won");
  });

  it("advances after a wrong guess and loses after day three", () => {
    let state = gameReducer(initialGameState, {
      type: "START",
      round: round(1),
    });
    state = gameReducer(state, {
      type: "SUBMIT",
      countryCode: "THA",
      nextRound: round(2, 1),
    });
    expect(state.round?.day).toBe(2);
    expect(state.lastWrongCountry?.code).toBe("VNM");
    state = gameReducer(state, {
      type: "SUBMIT",
      countryCode: "VNM",
      nextRound: round(3, 2),
    });
    state = gameReducer(state, { type: "SUBMIT", countryCode: "VNM" });
    expect(state.status).toBe("lost");
  });

  it("keeps purchased clues across days and resets them for a new attempt", () => {
    let state = gameReducer(initialGameState, {
      type: "START",
      round: round(1),
    });
    state = gameReducer(state, { type: "BUY_CLUE", cost: 75, maxClues: 5 });
    state = gameReducer(state, { type: "BUY_CLUE", cost: 125, maxClues: 5 });
    expect(state.revealedClueCount).toBe(5);
    expect(state.pointsSpentThisAttempt).toBe(200);

    state = gameReducer(state, {
      type: "SUBMIT",
      countryCode: "THA",
      nextRound: round(2, 1),
    });
    expect(state.revealedClueCount).toBe(5);
    expect(state.pointsSpentThisAttempt).toBe(200);

    state = gameReducer(state, { type: "RESET" });
    state = gameReducer(state, { type: "START", round: round(1) });
    expect(state.revealedClueCount).toBe(3);
    expect(state.pointsSpentThisAttempt).toBe(0);
  });

  it("does not reveal clues beyond the dossier maximum", () => {
    let state = gameReducer(initialGameState, {
      type: "START",
      round: round(1),
    });
    state = gameReducer(state, { type: "BUY_CLUE", cost: 75, maxClues: 3 });
    expect(state.revealedClueCount).toBe(3);
  });

  it("keeps recovery mode across all three days and clears it on reset", () => {
    let state = gameReducer(initialGameState, {
      type: "START",
      round: round(1),
      isRecovery: true,
    });
    state = gameReducer(state, {
      type: "SUBMIT",
      countryCode: "THA",
      nextRound: round(2, 1),
    });
    state = gameReducer(state, {
      type: "SUBMIT",
      countryCode: "VNM",
      nextRound: round(3, 2),
    });
    expect(state.isRecovery).toBe(true);
    state = gameReducer(state, { type: "RESET" });
    expect(state.isRecovery).toBe(false);
  });
});
