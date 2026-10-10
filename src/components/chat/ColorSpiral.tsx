"use client";
import { ScreenStylePreview } from "./ScreenStylePreview";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { makePaletteCombinations } from "@/lib/palette-remix";
import { contrastRatio, type SeerResult } from "@/lib/seer-contract";
import { DesignPortfolio } from "./DesignPortfolio";
export function ColorSpiral({ result, onChoose, expanded = false, exploration, onExplore }: { exploration?: { seed: number; position: number }; onExplore?: (value: { seed: number; position: number }) => void; expanded?: boolean; result: SeerResult; onChoose: (result: SeerResult) => void }) {
  const [localSeed, setLocalSeed] = useState(1);
  const [localPosition, setLocalPosition] = useState(0);
  const seed = exploration?.seed ?? localSeed;
  const position = exploration?.position ?? localPosition;
  const setPosition = (value: number) => { if (onExplore) onExplore({ seed, position: value }); else setLocalPosition(value); };
  const randomize = () => { const value = Math.floor(Math.random() * 4294967296); if (onExplore) onExplore({ seed: value, position: 0 }); else { setLocalSeed(value); setLocalPosition(0); } };
  const combinations = useMemo(() => makePaletteCombinations(result.final, seed), [result.final, seed]);
  const current = combinations[position];
  const remix = { ...result, final: current.direction, contrastCorrections: current.corrections };
  const foreground = (color: string) => contrastRatio("#000000", color) >= contrastRatio("#ffffff", color) ? "#000000" : "#ffffff";
  const points = combinations.map((_, index) => {
    const angle = index * Math.PI * .8 - Math.PI / 2;
    const radius = 25 + index * 18;
    return { x: 120 + Math.cos(angle) * radius, y: 120 + Math.sin(angle) * radius };
  });
  const path = Array.from({ length: 81 }, (_, index) => {
    const t = index / 20, angle = t * Math.PI * .8 - Math.PI / 2, radius = 25 + t * 18;
    return `${index === 0 ? "M" : "L"}${120 + Math.cos(angle) * radius},${120 + Math.sin(angle) * radius}`;
  }).join(" ");
  return <details open={expanded || undefined} className="mt-3 rounded-xl border border-white/25 p-3 text-base text-white/90">
    <summary className={`${expanded ? "hidden" : ""} min-h-11 cursor-pointer py-2 font-semibold`}>Explore the color spiral</summary>
    <p className="mt-2">Five harmonious combinations use neutral surfaces, one primary accent and one dominant finish. Supporting colors stay restrained; text and control borders keep their checked contrast.</p>
    <div className="relative mx-auto my-3 aspect-square w-full max-w-[28rem]" role="group" aria-label="Color harmony spiral">
      <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden="true"><path d={path} fill="none" stroke="#ffdd58" strokeWidth="2" /></svg>
      {points.map((point, index) => <button key={index} type="button" aria-label={`Palette ${index + 1}: ${combinations[index].harmony}, ${combinations[index].finish}`} aria-pressed={position === index} onClick={() => setPosition(index)} className="absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-semibold" style={{ left: `${point.x / 2.4}%`, top: `${point.y / 2.4}%`, backgroundColor: combinations[index].direction.palette.accent, color: foreground(combinations[index].direction.palette.accent), borderColor: position === index ? "#e4ff68" : foreground(combinations[index].direction.palette.accent) }}>{index + 1}</button>)}
    </div>
    <label className="block">Color combination
      <input type="range" min="0" max="4" step="1" value={position} onChange={event => setPosition(Number(event.target.value))} aria-valuetext={`${position + 1} of 5: ${current.harmony}, ${current.finish}`} className="h-11 w-full accent-lime-200" />
    </label>
    <p role="status" className="font-semibold">{position + 1}. {current.harmony} · {current.finish}</p>
    <ScreenStylePreview direction={current.direction} finish={current.finish} />
    <div className="mb-3 flex flex-wrap gap-2">{current.accents.map((accent, index) => <span key={index} className="rounded-lg px-2 py-2 font-mono text-sm" style={{ backgroundColor: accent, color: foreground(accent) }}>{accent}</span>)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={() => onChoose(remix)} className="min-h-11 rounded-full border border-lime-200/40 px-4 text-lime-100">Use this palette</button><button type="button" onClick={randomize} className="min-h-11 rounded-full border border-lime-200/40 px-4 text-lime-100">New combinations</button></div>
    <DesignPortfolio result={remix} onChoose={onChoose} />
  </details>;
}
