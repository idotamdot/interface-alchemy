"use client";

import { useState } from "react";
import { ArrowUpRight, Layers, Sparkles } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { enforcePaletteContrast, type SeerDirection } from "@/lib/seer-contract";

// Render trusted tokens into real UI. Never execute AI-generated markup or CSS.
export function ScreenStylePreview({ direction, finish = "" }: { direction: SeerDirection; finish?: string }) {
  const [expanded, setExpanded] = useState(false);
  const safe = enforcePaletteContrast(direction).direction;
  const p = safe.palette;
  const words = `${safe.name} ${safe.direction} ${finish}`.toLowerCase();
  const editorial = /editorial|serif|classic|ceremonial|luxury/.test(words);
  const angular = /brutalist|geometric|sharp|industrial/.test(words);
  const luminous = /glow|neon|luminous/.test(words);
  const radius = angular ? "4px" : "24px";
  const screen = (
    <div role="img" aria-label={`Sample screen in ${safe.name}: navigation, headline, action and three content cards. ${safe.direction}`}
      className="relative isolate overflow-hidden border-2 p-5 sm:p-8"
      style={{ backgroundColor: p.background, color: p.text, borderColor: p.border, borderRadius: radius, fontFamily: editorial ? "ui-serif, Georgia, serif" : "system-ui, sans-serif" }}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[32px] opacity-20" style={{ borderColor: p.accent }} aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-4 border-b-2 pb-5" style={{ borderColor: p.border }}>
        <div className="flex items-center gap-3 text-xl font-bold"><Layers aria-hidden="true" /> Forma</div>
        <span className="text-base" style={{ color: p.mutedText }}>Explore · Collection · About</span>
      </div>
      <div className="relative py-9 sm:py-12">
        <span className="inline-flex items-center gap-2 border-2 px-3 py-2 text-base" style={{ borderColor: p.border, borderRadius: radius }}><Sparkles size={18} aria-hidden="true" /> A little everyday inspiration</span>
        <h4 className="mt-6 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">Make room for<br />something wonderful.</h4>
        <p className="mt-5 max-w-lg text-lg leading-8" style={{ color: p.mutedText }}>Thoughtful details. A fresh perspective. Find the things that feel like you.</p>
        <span className="mt-6 inline-flex min-h-12 items-center gap-3 border-2 px-5 py-3 text-lg font-semibold"
          style={{ backgroundColor: p.accent, color: p.accentText, borderColor: p.border, borderRadius: radius, boxShadow: luminous ? `0 0 24px ${p.accent}66` : undefined }}>Explore the collection <ArrowUpRight aria-hidden="true" size={20} /></span>
      </div>
      <div className="relative grid gap-4 sm:grid-cols-3">
        {["Find your rhythm", "A fresh start", "Small wonders"].map((title, index) => (
          <div key={title} className="overflow-hidden border-2" style={{ borderColor: p.border, borderRadius: radius }}>
            <div className="relative flex h-28 items-center justify-center overflow-hidden" style={{ backgroundColor: p.accent, color: p.accentText }} aria-hidden="true">
              <div className={`h-16 w-16 border-4 ${index === 0 ? "rounded-full" : index === 1 ? "rotate-45" : "rounded-t-full"}`} style={{ borderColor: p.accentText }} />
            </div>
            <div className="p-4"><p className="text-lg font-semibold">{title}</p><p className="mt-2 text-base leading-7" style={{ color: p.mutedText }}>Discover your next favorite.</p></div>
          </div>
        ))}
      </div>
      <p className="relative mt-6 text-base" style={{ color: p.mutedText }}>Made for curiosity. Designed with care.</p>
    </div>
  );
  return <figure className="my-6">
    {screen}
    <figcaption className="mt-3 text-base leading-7 text-white/90">Sample screen · your chosen style will be applied to your wireframes.</figcaption>
    <button type="button" onClick={() => setExpanded(true)} className="mt-3 min-h-12 rounded-full border border-white/40 px-5 text-lg">View {safe.name} full screen</button>
    <Dialog open={expanded} onOpenChange={setExpanded}>
      <DialogContent showCloseButton={false} className="inset-0 top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-[#241109] p-5 text-white sm:max-w-none sm:p-10">
        <header className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-4"><div><DialogTitle className="text-3xl">{safe.name}</DialogTitle><DialogDescription className="mt-3 text-lg text-white/90">Review this visual style on a sample screen.</DialogDescription></div><DialogClose className="min-h-12 rounded-full border border-white/40 px-5 text-lg">Back to designs</DialogClose></header>
        <div className="mx-auto max-w-5xl">{screen}</div>
      </DialogContent>
    </Dialog>
  </figure>;
}
