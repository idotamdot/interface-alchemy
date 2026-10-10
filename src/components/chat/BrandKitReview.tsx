"use client";
import { useEffect, useRef, useState } from "react";
import { BRAND_LAYOUTS, BUILDER_ORIGIN, parseBrandPackage, renderBrandAsset, type BrandPackage } from "@/lib/brand-package";
import type { BrandImage } from "@/lib/branding-contract";
const control="min-h-12 rounded-xl border border-white/30 bg-[#241109] px-4 text-lg text-white";
export function useBrandKit() {
  const [name,setName]=useState(""); const [tagline,setTagline]=useState("");
  const [kit,setKit]=useState<BrandPackage|null>(null); const [acceptedKit,setAcceptedKit]=useState<BrandPackage|null>(null);
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const request=useRef<AbortController|null>(null);
  useEffect(()=>()=>request.current?.abort(),[]);
  const generate=async(source:BrandImage,alt:string)=>{
    if(busy)return; const controller=new AbortController();request.current=controller;setBusy(true);setError("");
    try { const response=await fetch("/api/brand-kit",{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({name,tagline,source:{id:source.id,image:source.image,style:source.style,alt}})});const data=await response.json();if(!response.ok)throw Error(data.error||"The brand kit could not finish.");setKit(parseBrandPackage(data.kit)); }
    catch(cause){if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"The previous kit is intact. Try again.");}
    finally{if(!controller.signal.aborted)setBusy(false);}
  };
  return {name,setName,tagline,setTagline,kit,acceptedKit,busy,error,generate,accept:()=>{if(kit)setAcceptedKit(parseBrandPackage({...kit,acceptedAt:new Date().toISOString()}));}};
}
export function BrandKitReview({ source, alt, state }: { source:BrandImage;alt:string;state:ReturnType<typeof useBrandKit> }) {
  const [handoff,setHandoff]=useState("");
  const cleanup=useRef<(()=>void)|null>(null);
  useEffect(()=>()=>cleanup.current?.(),[]);
  const send=()=>{
    if(!state.acceptedKit)return;cleanup.current?.();
    const snapshot=parseBrandPackage(state.acceptedKit); const token=crypto.randomUUID(); let target:Window|null=null;
    let timeout:ReturnType<typeof setTimeout>;
    const stop=()=>{window.removeEventListener("message",listener);clearTimeout(timeout);};
    const listener=(event:MessageEvent)=>{
      if(event.origin!==BUILDER_ORIGIN || event.source!==target || !event.data || event.data.token!==token)return;
      if(event.data.type==="screen-seer-builder-ready")target?.postMessage({type:"screen-seer-build-package",token,package:snapshot},BUILDER_ORIGIN);
      if(event.data.type==="screen-seer-builder-received"){setHandoff("Website Builder received your accepted brand kit. Open that tab to review it alongside your wireframes.");stop();}
      if(event.data.type==="screen-seer-builder-rejected"){setHandoff("Website Builder could not validate this kit. Your accepted package is intact; try again.");stop();}
    };
    window.addEventListener("message",listener);target=window.open(`${BUILDER_ORIGIN}/#seer-handoff=${token}`,"_blank");
    if(!target){stop();setHandoff("Allow this studio to open Website Builder, then try again. Your kit is intact.");return;}
    setHandoff("Opening Website Builder and waiting for its receipt…");timeout=setTimeout(()=>{stop();setHandoff("Website Builder did not confirm receipt. Your kit is intact; return here and try again.");},30000);cleanup.current=stop;
  };
  const matching=state.kit?.branding.source.id===source.id;
  return <section className="mt-8 space-y-6" aria-label="Brand kit">
    <form onSubmit={event=>{event.preventDefault();void state.generate(source,alt);}} className="seer-home-card seer-pink">
      <h3 className="text-3xl font-semibold">Build a brand around this artwork.</h3><p>Your image inspires the colors, typography, brand voice and coordinated asset layouts.</p>
      <label className="w-full">Brand name<input required maxLength={60} value={state.name} onChange={event=>state.setName(event.target.value)} className={`${control} mt-2 w-full`} /></label>
      <label className="w-full">Tagline (optional)<input maxLength={100} value={state.tagline} onChange={event=>state.setTagline(event.target.value)} className={`${control} mt-2 w-full`} /></label>
      <button type="submit" disabled={state.busy || !alt.trim()} className="min-h-14 rounded-full bg-pink-200 px-7 font-semibold text-[#211109] disabled:opacity-60">{state.busy?"Reading your artwork…":"Create my brand kit"}</button>
      <p role="status">{state.busy?"Finding the visual thread in your artwork. Your previous kit stays intact.":"Review the complete kit before adding it to the build package."}</p>{state.error&&<p role="alert">{state.error}</p>}
    </form>
    {state.kit&&<>
      {!matching&&<p role="status">This kit belongs to the previous artwork. Create a new kit to use the current image.</p>}
      <section className="seer-home-card seer-lime"><h3 className="text-3xl font-semibold">{state.kit.branding.name} · brand system</h3><p>{state.kit.branding.inspiration}</p><p>Brand voice: {state.kit.branding.voice}</p><div className="flex flex-wrap gap-3">{Object.entries(state.kit.branding.palette).map(([role,color])=><div key={role} className="rounded-xl border border-white/40 p-3"><span className="mb-2 block h-12 rounded-lg" style={{backgroundColor:color}} />{role}: {color}</div>)}</div><p>Headings: {state.kit.branding.typography.heading}. Body: system fonts, 18px minimum, with language-appropriate fallbacks.</p></section>
      <div className="grid gap-6 sm:grid-cols-2">{BRAND_LAYOUTS.map(asset=><article key={asset.role} className="seer-home-card seer-clear"><h4 className="text-2xl font-semibold">{asset.label}</h4><img src={renderBrandAsset(state.kit!,asset.role)} alt={`${state.kit!.branding.name} ${asset.label} layout`} className="max-h-80 w-full rounded-xl object-contain" /><p>{asset.width} × {asset.height}. {asset.role==="favicon"?"Check this small-size preview carefully; detailed artwork may need a simpler symbol.":"Coordinated from your accepted artwork."}</p>{asset.role==="favicon"&&<img src={renderBrandAsset(state.kit!,asset.role)} alt="Favicon at actual size" width={32} height={32}/>}</article>)}</div>
      <section className="seer-home-card seer-clear"><h4 className="text-2xl font-semibold">Usage guide</h4><ul className="list-disc space-y-3 pl-5">{state.kit.branding.guidelines.map((rule,index)=><li key={index}>{rule}</li>)}</ul><button type="button" disabled={!matching} onClick={state.accept} className={control}>Accept kit into build package</button></section>
    </>}
    {state.acceptedKit&&<section className="seer-home-card seer-lime" aria-label="Accepted build package"><h3 className="text-3xl font-semibold">Build package: {state.acceptedKit.branding.name}</h3><p>Contains the approved artwork, {state.acceptedKit.branding.assets.length} asset layouts, checked color tokens, typography and usage guide. This accepted snapshot stays intact while you explore other artwork.</p><button type="button" onClick={send} className={control}>Send package to Website Builder</button><p role="status">{handoff}</p><p>Kept in these open tabs for now. Reloading clears the session package.</p></section>}
  </section>;
}
