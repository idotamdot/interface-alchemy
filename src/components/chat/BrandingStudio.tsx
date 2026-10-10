"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { artStyles, brandingResultSchema, type BrandImage } from "@/lib/branding-contract";
const control = "min-h-12 rounded-xl border border-white/30 bg-[#241109] px-4 text-lg text-white";
export function BrandingStudio({ open, onOpenChange, motionPaused }: { open: boolean; onOpenChange: (open: boolean) => void; motionPaused: boolean }) {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<(typeof artStyles)[number]>("Geometric");
  const [kind, setKind] = useState<"artwork" | "icon">("artwork");
  const [count, setCount] = useState(1);
  const [images, setImages] = useState<BrandImage[]>([]);
  const [accepted, setAccepted] = useState<BrandImage | null>(null);
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/branding", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description, style, kind, count }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Artwork could not be generated. Try again.");
      setImages(brandingResultSchema.parse(data).images);
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Artwork could not be generated. Your work is intact."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} data-motion={motionPaused ? "paused" : "playing"} className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-none border-0 bg-[#211109] p-5 text-white sm:max-w-none sm:p-10">
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-3 text-lg text-pink-200">The branding room</p><DialogTitle className="text-4xl sm:text-6xl">Give your idea a face.</DialogTitle><DialogDescription className="mt-4 max-w-2xl text-lg leading-8 text-white/90">Describe your artwork or icon, choose its style, and review what the AI creates. Accept only what you want to keep.</DialogDescription></div><DialogClose className={control}>Back to studio home</DialogClose></header>
      <form onSubmit={generate} className="seer-home-card seer-pink min-h-0">
        <label className="w-full text-xl">What do you imagine?<textarea required minLength={3} maxLength={3000} value={description} onChange={event => setDescription(event.target.value)} placeholder="A luminous hummingbird made of folded copper and pink glass, for a creative community…" className={`${control} mt-3 min-h-36 w-full p-5 leading-8`} /></label>
        <div className="flex w-full flex-wrap gap-5"><label>Art style<select className={`${control} mt-2 block`} value={style} onChange={event => setStyle(event.target.value as typeof style)}>{artStyles.map(value => <option key={value}>{value}</option>)}</select></label><label>Create<select className={`${control} mt-2 block`} value={kind} onChange={event => setKind(event.target.value as typeof kind)}><option value="artwork">Brand artwork</option><option value="icon">Brand icon</option></select></label><label>Options<select className={`${control} mt-2 block`} value={count} onChange={event => setCount(Number(event.target.value))}>{[1,2,3].map(value => <option key={value}>{value}</option>)}</select></label></div>
        <button disabled={busy} type="submit" className="min-h-14 rounded-full bg-pink-200 px-7 text-lg font-semibold text-[#211109] disabled:opacity-60">{busy ? "Creating your artwork…" : "Create artwork"}</button>
        <p role="status">{busy ? "This may take a minute. You can return home while it works; your previous artwork stays intact." : "Choices stay in this studio session. Downloads and account saving are not part of this step yet."}</p>
        {error && <p role="alert" className="text-pink-100">{error}</p>}
      </form>
      <section aria-label="Artwork options" className="mt-8 grid gap-6 md:grid-cols-2">{images.map((image, index) => <article key={image.id} className="seer-home-card seer-pink"><h3 className="text-2xl font-semibold">{image.style} {image.kind} · {index + 1}</h3>{/* Actual generated image data; no placeholder artwork. */}<img src={image.image} alt={`AI-generated ${image.style} ${image.kind} concept for: ${image.description}`} className="aspect-square w-full rounded-2xl bg-[#f1e5d6] object-contain" /><button type="button" aria-pressed={accepted?.id === image.id} onClick={() => { setAccepted(image); setAltText(image.description); }} className={control}>{accepted?.id === image.id ? "Accepted for this session" : "Use this artwork"}</button></article>)}</section>
      {accepted && <section aria-label="Accepted branding" className="seer-home-card seer-lime mt-8"><h3 className="text-2xl font-semibold">Your accepted {accepted.kind}</h3><img src={accepted.image} alt={altText} className="max-h-72 rounded-xl bg-[#f1e5d6] object-contain" /><label className="w-full">Describe the image for screen readers<input value={altText} maxLength={500} onChange={event => setAltText(event.target.value)} className={`${control} mt-3 w-full`} /></label><p>Review this description to match what the artwork actually shows. Brand icons still need readable labels when used as controls.</p><button type="button" onClick={() => setAccepted(null)} className={control}>Remove choice</button></section>}
    </div>
  </DialogContent></Dialog>;
}
