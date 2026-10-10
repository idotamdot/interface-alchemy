import { enforcePaletteContrast, type SeerDirection } from "./seer-contract";
export const HARMONIES = [
  { name: "Analogous", offsets: [0, 30, 330] },
  { name: "Complementary", offsets: [0, 180] },
  { name: "Triadic", offsets: [0, 120, 240] },
  { name: "Split complementary", offsets: [0, 150, 210] },
  { name: "Tetradic", offsets: [0, 90, 180, 270] },
] as const;
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return 0;
  return ((max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
}
function color(h: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs(sector % 2 - 1));
  const rgb = sector < 1 ? [chroma, x, 0] : sector < 2 ? [x, chroma, 0] : sector < 3 ? [0, chroma, x] : sector < 4 ? [0, x, chroma] : sector < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = lightness - chroma / 2;
  return "#" + rgb.map(c => Math.round((c + m) * 255).toString(16).padStart(2, "0")).join("");
}
export function makePaletteCombinations(base: SeerDirection, seed: number) {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  return HARMONIES.map((harmony, index) => {
    const finishes = ["Matte", "Gold leaf", "Sparkle", "Neon", "Soft glow"] as const;
    const finish = finishes[(index + (seed >>> 0) % finishes.length) % finishes.length];
    const anchor = finish === "Gold leaf" ? 38 + random() * 12 : (hue(base.palette.accent) + random() * 360) % 360;
    const saturation = finish === "Neon" ? .85 : .48 + random() * .3;
    const lightness = .48 + random() * .15;
    const accents = harmony.offsets.map(offset => color(anchor + offset, saturation, lightness));
    const dark = finish === "Neon" || finish === "Soft glow" || random() < .5;
    const background = color(anchor + 15, .2, dark ? .08 : .96);
    const candidate = { ...base, name: `${base.name.slice(0, 200)} · ${harmony.name}`, direction: `${base.direction.slice(0, 1400)} Color remix: ${harmony.name} relationships with supporting decorative accents ${accents.slice(1).join(", ")}. Keep the layout and type direction unchanged. Finish: ${finish}, restricted to decorative edges and accents. Use neutral surfaces, one primary accent, and supporting colors sparingly. Use only this one dominant finish, never stack gold, neon, glow and sparkle. Keep motion gentle and support reduced motion. Supporting accents are decorative; validate any new text or control use.`, palette: { background, accent: accents[0], text: dark ? "#ffffff" : "#000000", mutedText: dark ? "#cccccc" : "#444444", accentText: "#000000", border: dark ? "#ffffff" : "#000000" } };
    const checked = enforcePaletteContrast(candidate);
    return { ...checked, harmony: harmony.name, finish, accents, index };
  });
}
