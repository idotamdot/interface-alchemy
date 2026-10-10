import { expect, test } from "vitest";
import { makePaletteCombinations } from "../palette-remix";
import { checkPalette, directionSchema } from "../seer-contract";
const direction = directionSchema.parse({ name: "Warm", direction: "Keep mobile layout and bold type", rationale: "Friendly", palette: { background: "#241109", text: "#ffffff", mutedText: "#ffffff", accent: "#ffcf3d", accentText: "#000000", border: "#ffffff" } });
test("random color harmonies preserve contrast across light and dark combinations", () => {
  for (let seed = 0; seed < 100; seed++) {
    const combinations = makePaletteCombinations(direction, seed);
    expect(combinations).toHaveLength(5);
    expect(new Set(combinations.map(combo => combo.finish)).size).toBe(5);
    for (const combo of combinations) {
      expect(directionSchema.safeParse(combo.direction).success).toBe(true);
      for (const pair of checkPalette(combo.direction.palette)) expect(pair.ratio).toBeGreaterThanOrEqual(pair.minimum);
      expect(combo.direction.direction).toContain(direction.direction);
      expect(combo.direction.direction).toContain("only this one dominant finish");
    }
  }
});
test("keeps each saved seed stable while new seeds create new combinations", () => {
  expect(makePaletteCombinations(direction, 5)).toEqual(makePaletteCombinations(direction, 5));
  expect(makePaletteCombinations(direction, 5)).not.toEqual(makePaletteCombinations(direction, 6));
});
