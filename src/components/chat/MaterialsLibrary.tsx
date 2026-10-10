"use client";

import { checkPalette, enforcePaletteContrast, type SeerDirection } from "@/lib/seer-contract";

/** Token-based visual inspection; no invented font, shadow, or spacing specifications. */
export function MaterialsLibrary({ direction }: { direction: SeerDirection }) {
 const safe = enforcePaletteContrast(direction).direction;
 const p = safe.palette;
 const swatches = [
  ["Background",p.background],["Primary text",p.text],["Secondary text",p.mutedText],
  ["Accent",p.accent],["Accent text",p.accentText],["Border",p.border],
 ];
 return <section aria-label="Materials library for selected direction" className="space-y-7">
  <header><p className="seer-atelier-eyebrow">THE MATERIALS LIBRARY</p><h3 className="mt-3 font-serif text-3xl sm:text-5xl">{safe.name}</h3><p className="mt-3 max-w-3xl text-base leading-7 text-[#d0cce0]">{safe.direction}</p></header>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
   {swatches.map(([name,color])=><div key={name} className="seer-material-card">
    <div className="h-24 rounded-xl border border-white/20" style={{backgroundColor:color}} aria-hidden="true"/>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><strong>{name}</strong><code className="text-sm text-[#cfcbdf]">{color}</code></div>
   </div>)}
  </div>
  <div className="grid gap-5 lg:grid-cols-2">
   <article className="seer-material-card"><h4 className="mb-4 text-xl font-semibold">Applied interface materials</h4>
    <div className="rounded-2xl border p-5" style={{backgroundColor:p.background,color:p.text,borderColor:p.border}}>
      <p className="text-lg font-semibold">A thoughtful first impression</p>
      <p className="mt-2" style={{color:p.mutedText}}>This is a live rendering of your actual palette tokens, not a screenshot or a finished application.</p>
      <div className="mt-5 flex flex-wrap gap-3">
       <span className="inline-flex min-h-11 items-center rounded-xl px-5 font-semibold" style={{backgroundColor:p.accent,color:p.accentText}}>Primary action</span>
       <span className="inline-flex min-h-11 items-center rounded-xl border px-5" style={{borderColor:p.border}}>Secondary action</span>
      </div>
     </div>
   </article>
   <article className="seer-material-card"><h4 className="mb-4 text-xl font-semibold">Measured contrast</h4>
    <ul className="space-y-3">{checkPalette(p).map(check=><li key={check.pair} className="flex justify-between gap-4 border-b border-white/10 pb-3"><span>{check.pair}</span><span className="font-mono">{check.ratio.toFixed(2)}:1 <span className="text-[#c4bfdb]">/ {check.minimum}:1</span></span></li>)}</ul>
    <p className="mt-4 text-sm leading-6 text-[#bdb9cf]">These checks only assess solid palette pairs. Full rendered accessibility and focus testing are still required.</p>
   </article>
  </div>
  <p className="text-sm leading-6 text-[#c8c3da]">Typography families, spacing scales, and motion specifications have not been generated as structured tokens. They must be defined and reviewed before design-system handoff.</p>
 </section>;
}
