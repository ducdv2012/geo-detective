import { describe, expect, it } from "vitest";
import { fallbackCountries } from "../data/fallbackCountries";
import { dossiers } from "../data/dossiers";
import { generateUniquePuzzle, matchesClues, seededRandom } from "./puzzle";

describe("generateUniquePuzzle", () => {
  it("generates a uniquely solvable eight-country puzzle across many seeds", () => {
    for (let seed = 0; seed < 250; seed += 1) {
      const puzzle = generateUniquePuzzle(
        fallbackCountries,
        1,
        seededRandom(seed),
      );
      expect(puzzle.options).toHaveLength(8);
      expect(
        puzzle.options.filter((country) => matchesClues(country, puzzle.clues)),
      ).toEqual([puzzle.target]);
    }
  });

  it("excludes the previous target", () => {
    const puzzle = generateUniquePuzzle(
      fallbackCountries,
      2,
      seededRandom(42),
      ["VNM"],
    );
    expect(puzzle.target.code).not.toBe("VNM");
  });

  it("supports every dossier complexity with one valid answer", () => {
    for (const dossier of dossiers) {
      for (let seed = 0; seed < 40; seed += 1) {
        const puzzle = generateUniquePuzzle(
          fallbackCountries,
          1,
          seededRandom(seed),
          [],
          dossier.clueKinds,
          dossier.optionCount,
        );
        expect(puzzle.clues).toHaveLength(dossier.clueKinds.length);
        expect(puzzle.options).toHaveLength(dossier.optionCount);
        expect(
          puzzle.options.filter((country) =>
            matchesClues(country, puzzle.clues),
          ),
        ).toEqual([puzzle.target]);
      }
    }
  });
});
