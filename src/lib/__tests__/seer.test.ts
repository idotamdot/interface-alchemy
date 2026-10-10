import { expect, test, vi } from "vitest";
import { contrastRatio, seerResultSchema } from "../seer-contract";
import { deliberateDirection } from "../seer";
const direction = { name: "Sunlit", direction: "Warm editorial", rationale: "Readable", palette: { background: "#ffffff", text: "#000000", mutedText: "#333333", accent: "#ffff00", accentText: "#000000", border: "#000000" } };
test("measures contrast and rejects a low contrast final palette", () => {
  expect(contrastRatio("#ffffff", "#000000")).toBe(21);
  expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  expect(seerResultSchema.safeParse({ proposal: direction, critique: "Fine", final: { ...direction, palette: { ...direction.palette, mutedText: "#eeeeee" } } }).success).toBe(false);
});
test("runs idea, independent opinion, final choice in order with the critique supplied", async () => {
  const call = vi.fn().mockResolvedValueOnce(JSON.stringify(direction)).mockResolvedValueOnce("Make typography clearer").mockResolvedValueOnce(JSON.stringify(direction));
  const result = await deliberateDirection("Neighborhood shop", new AbortController().signal, call);
  expect(call.mock.calls.map(args => args[0])).toEqual(["openai", "gemini", "openai"]);
  expect(call.mock.calls[2][2]).toContain("Make typography clearer");
  expect(result.critique).toBe("Make typography clearer");
});
test("does not publish a final choice when critique fails", async () => {
  const call = vi.fn().mockResolvedValueOnce(JSON.stringify(direction)).mockRejectedValueOnce(new Error("unavailable"));
  await expect(deliberateDirection("shop", new AbortController().signal, call)).rejects.toThrow();
  expect(call).toHaveBeenCalledTimes(2);
});

test("corrects weak text pairs while preserving the final AI background and accent", async () => {
  const weak = { ...direction, palette: { ...direction.palette, text: "#eeeeee", mutedText: "#dddddd", accentText: "#ffffaa" } };
  const call = vi.fn().mockResolvedValueOnce(JSON.stringify(direction)).mockResolvedValueOnce("Improve contrast").mockResolvedValueOnce(JSON.stringify(weak));
  const result = await deliberateDirection("shop", new AbortController().signal, call);
  expect(result.final.palette.background).toBe(weak.palette.background);
  expect(result.final.palette.accent).toBe(weak.palette.accent);
  expect(result.contrastCorrections).toEqual(["text", "mutedText", "accentText"]);
  expect(seerResultSchema.safeParse(result).success).toBe(true);
});
