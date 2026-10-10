"use client";
import { useState } from "react";
import { enforcePaletteContrast, type SeerDirection } from "@/lib/seer-contract";
type Device = "desktop" | "tablet" | "mobile";
type Composition = "landing" | "dashboard" | "form";
export function AtelierStage({ direction }: { direction: SeerDirection }) {
 const [device,setDevice]=useState<Device>("desktop");
 const [composition,setComposition]=useState<Composition>("landing");
 const p=enforcePaletteContrast(direction).direction.palette;
 return <section aria-label="Atelier stage" className="space-y-5">
  <header><p className="seer-atelier-eyebrow">THE STAGE / STYLE PROOF</p><h3 className="mt-3 font-serif text-3xl sm:text-5xl">See the direction in context.</h3><p className="mt-3 text-[#c9c5dc]">These are interactive viewport and composition previews driven by your selected palette. They are illustrative templates, not imported wireframes or working app screens.</p></header>
  <div className="flex flex-wrap gap-4">
   <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-sm text-[#cac6db]">Viewport</legend>{(["desktop","tablet","mobile"] as const).map(value=><button type="button" key={value} aria-pressed={device===value} onClick={()=>setDevice(value)} className="seer-stage-toggle">{value}</button>)}</fieldset>
   <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-sm text-[#cac6db]">Sample composition</legend>{(["landing","dashboard","form"] as const).map(value=><button type="button" key={value} aria-pressed={composition===value} onClick={()=>setComposition(value)} className="seer-stage-toggle">{value}</button>)}</fieldset>
  </div>
  <div className="seer-stage-canvas"><div className="seer-stage-viewport" style={{maxWidth:device==="mobile"?390:device==="tablet"?768:1100}}>
   <div className="overflow-hidden rounded-2xl border" style={{backgroundColor:p.background,color:p.text,borderColor:p.border}}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5" style={{borderColor:p.border}}><strong>FORMA / concept</strong><span style={{color:p.mutedText}}>Home · Discover · About</span></div>
    {composition==="landing"&&<div className="p-7 sm:p-10"><p style={{color:p.mutedText}}>A considered experience</p><h4 className="mt-6 max-w-2xl font-serif text-4xl sm:text-6xl leading-tight">Designed to leave an impression.</h4><p className="mt-5 max-w-xl text-lg" style={{color:p.mutedText}}>See how this visual language shapes hierarchy, contrast and rhythm.</p><span className="mt-7 inline-flex rounded-xl px-5 py-3 font-semibold" style={{backgroundColor:p.accent,color:p.accentText}}>Discover more ↗</span><div className="mt-9 grid gap-3 sm:grid-cols-3">{["Clarity","Expression","Purpose"].map(x=><div key={x} className="rounded-xl border p-5" style={{borderColor:p.border}}>{x}</div>)}</div></div>}
    {composition==="dashboard"&&<div className="grid gap-4 p-6 sm:grid-cols-3">{["Overview","Recent activity","Workspace"].map((x,i)=><div key={x} className="rounded-xl border p-5" style={{borderColor:p.border}}><p style={{color:p.mutedText}}>{x}</p><p className="mt-6 text-3xl font-semibold">{["01","—","03"][i]}</p><div className="mt-5 h-2 rounded" style={{backgroundColor:p.accent,opacity:.65}}/></div>)}</div>}
    {composition==="form"&&<div className="mx-auto max-w-xl p-7 sm:p-10"><h4 className="text-3xl font-serif">Start a conversation.</h4><p className="mt-3" style={{color:p.mutedText}}>Visual form preview — submission disabled.</p>{["Name","Email","Your idea"].map(x=><div key={x} className="mt-5"><span className="text-sm">{x}</span><div aria-hidden="true" className="mt-2 h-12 rounded-xl border" style={{borderColor:p.border}}/></div>)}<span className="mt-6 inline-flex rounded-xl px-6 py-3 font-semibold" style={{backgroundColor:p.accent,color:p.accentText}}>Sample action</span></div>}
   </div>
  </div></div>
  <p className="text-sm text-[#bcb8d0]">Viewport widths: desktop up to 1100px; tablet up to 768px; mobile up to 390px. This previews material treatment, not real UX or backend behavior.</p>
 </section>;
}
