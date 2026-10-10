import { z } from "zod";
const text = z.string().trim().min(1).max(1800);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const directionSchema = z.object({
  name: text, direction: text, rationale: text,
  palette: z.object({ background: hex, text: hex, mutedText: hex, accent: hex, accentText: hex, border: hex }),
});
export type SeerDirection = z.infer<typeof directionSchema>;
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export function checkPalette(p: SeerDirection["palette"]) {
  return [
    { pair: "Body text", ratio: contrastRatio(p.text, p.background), minimum: 4.5 },
    { pair: "Secondary text", ratio: contrastRatio(p.mutedText, p.background), minimum: 4.5 },
    { pair: "Button text", ratio: contrastRatio(p.accentText, p.accent), minimum: 4.5 },
    { pair: "Control borders", ratio: contrastRatio(p.border, p.background), minimum: 3 },
  ];
}
export const seerResultSchema = z.object({ proposal: directionSchema, critique: text, final: directionSchema }).superRefine((result, ctx) => {
  for (const check of checkPalette(result.final.palette)) if (check.ratio < check.minimum) ctx.addIssue({ code: "custom", message: `${check.pair} needs ${check.minimum}:1 contrast` });
});
export type SeerResult = z.infer<typeof seerResultSchema>;
export function directionPrompt(result: SeerResult): string {
  const p = result.final.palette;
  return `Visual direction: ${result.final.name}. ${result.final.direction}\nUse solid color tokens: background ${p.background}, text ${p.text}, secondary text ${p.mutedText}, accent ${p.accent}, accent text ${p.accentText}, control border ${p.border}. Preserve these measured text/background pairs. Keep text off gradients and translucent surfaces unless every rendered background meets 4.5:1 contrast; controls and focus indicators need 3:1. Preserve the product requirements, readable mobile text, keyboard access and reduced-motion support.`;
}
