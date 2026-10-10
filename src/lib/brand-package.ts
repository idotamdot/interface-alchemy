// Shared contract with Website Builder. Assets are safe layout recipes, never executable SVG input.
export const BRAND_LAYOUTS = [
  { role: "primary-logo", label: "Primary logo", width: 1000, height: 360, layout: "logo" },
  { role: "reverse-logo", label: "Reverse logo", width: 1000, height: 360, layout: "logo" },
  { role: "stacked-logo", label: "Stacked logo", width: 640, height: 640, layout: "stacked" },
  { role: "wordmark", label: "Wordmark", width: 1000, height: 240, layout: "wordmark" },
  { role: "brand-symbol", label: "Brand symbol", width: 512, height: 512, layout: "symbol" },
  { role: "favicon", label: "Favicon", width: 32, height: 32, layout: "symbol" },
  { role: "app-icon", label: "App icon", width: 512, height: 512, layout: "symbol" },
  { role: "touch-icon", label: "Touch icon", width: 180, height: 180, layout: "symbol" },
  { role: "social-avatar", label: "Social avatar", width: 400, height: 400, layout: "symbol" },
  { role: "social-cover", label: "Social cover", width: 1500, height: 500, layout: "social" },
  { role: "social-post", label: "Social post", width: 1080, height: 1080, layout: "social" },
  { role: "share-card", label: "Link preview", width: 1200, height: 630, layout: "social" },
  { role: "hero-artwork", label: "Hero artwork", width: 1600, height: 900, layout: "artwork" },
  { role: "business-card-front", label: "Business card front", width: 1050, height: 600, layout: "social" },
  { role: "business-card-back", label: "Business card back", width: 1050, height: 600, layout: "stacked" },
  { role: "letterhead", label: "Letterhead", width: 850, height: 1100, layout: "stationery" },
  { role: "email-signature", label: "Email signature", width: 600, height: 200, layout: "logo" },
  { role: "brand-pattern", label: "Brand pattern", width: 1200, height: 800, layout: "pattern" },
] as const;
export type BrandPalette = { background: string; text: string; mutedText: string; accent: string; accentText: string; border: string };
export type BrandPackage = {
  format: "screen-seer-build/v1";
  acceptedAt: string;
  branding: {
    name: string; tagline: string; source: { id: string; image: string; alt: string; style: string };
    palette: BrandPalette; typography: { heading: "system-ui" | "ui-serif"; body: "system-ui"; minimumBodyPx: 18 };
    inspiration: string; voice: string; guidelines: string[];
    assets: typeof BRAND_LAYOUTS;
  };
};
export function brandContrast(a: string, b: string) {
  const luminance = (hex: string) => { const c = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4); return c[0]*.2126+c[1]*.7152+c[2]*.0722; };
  const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function parseBrandPackage(value: unknown): BrandPackage {
  const fail = () => { throw new Error("The branding package is incomplete or failed its accessibility checks."); };
  if (!value || typeof value !== "object") return fail();
  const p = value as BrandPackage, b = p.branding;
  const text = (v: unknown, max: number, required = true) => typeof v === "string" && v.length <= max && (!required || v.trim().length > 0);
  if (p.format !== "screen-seer-build/v1" || !text(p.acceptedAt,40) || !Number.isFinite(Date.parse(p.acceptedAt)) || !b || !text(b.name,60) || !text(b.tagline,100,false) || !b.source || !text(b.source.id,100) || !text(b.source.alt,500) || !text(b.source.style,80) || !text(b.source.image,1800000) || !/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(b.source.image)) return fail();
  if (!b.palette || !["background","text","mutedText","accent","accentText","border"].every(key => /^#[0-9a-fA-F]{6}$/.test(b.palette[key as keyof BrandPalette]))) return fail();
  const c=b.palette;
  if (brandContrast(c.text,c.background)<4.5 || brandContrast(c.mutedText,c.background)<4.5 || brandContrast(c.accentText,c.accent)<4.5 || brandContrast(c.border,c.background)<3) return fail();
  if (!b.typography || !["system-ui","ui-serif"].includes(b.typography.heading) || b.typography.body !== "system-ui" || b.typography.minimumBodyPx !== 18 || !text(b.inspiration,1200) || !text(b.voice,500) || !Array.isArray(b.guidelines) || b.guidelines.length > 12 || !b.guidelines.every(s => text(s,500)) || JSON.stringify(b.assets) !== JSON.stringify(BRAND_LAYOUTS)) return fail();
  // Reconstruct only known fields. Do not carry extra instructions, URLs or markup.
  return { format: p.format, acceptedAt: p.acceptedAt, branding: { name: b.name, tagline: b.tagline, source: { id:b.source.id, image:b.source.image, alt:b.source.alt, style:b.source.style }, palette: { background:c.background,text:c.text,mutedText:c.mutedText,accent:c.accent,accentText:c.accentText,border:c.border }, typography: { heading:b.typography.heading,body:"system-ui",minimumBodyPx:18 }, inspiration:b.inspiration,voice:b.voice,guidelines:[...b.guidelines],assets:BRAND_LAYOUTS } };
}
export function renderBrandAsset(pkg: BrandPackage, role: typeof BRAND_LAYOUTS[number]["role"]): string {
  const base=pkg.branding, b=role === "reverse-logo" ? { ...base, palette: { ...base.palette, background:base.palette.accent,text:base.palette.accentText } } : base, a=BRAND_LAYOUTS.find(item => item.role===role)!;
  const esc=(s:string)=>s.replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]!));
  const {width:w,height:h}=a;
  const image=(x:number,y:number,size:number)=>`<image href="${b.source.image}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  const title=(x:number,y:number,size:number,anchor="start")=>`<text x="${x}" y="${y}" fill="${b.palette.text}" font-family="${b.typography.heading}" font-size="${size}" text-anchor="${anchor}" textLength="${anchor === "middle" ? w*.8 : w*.55}" lengthAdjust="spacingAndGlyphs">${esc(b.name)}</text>`;
  let content="";
  if(a.layout==="symbol" || a.layout==="artwork") content=image((w-h*.8)/2,h*.1,h*.8);
  if(a.layout==="logo") content=image(w*.04,h*.12,h*.76)+title(w*.36,h*.55,h*.19);
  if(a.layout==="stacked") content=image(w*.25,h*.08,w*.5)+title(w*.5,h*.78,h*.09,"middle");
  if(a.layout==="wordmark") content=title(w*.5,h*.62,h*.35,"middle");
  if(a.layout==="social") content=image(w*.59,h*.12,Math.min(w*.35,h*.75))+title(w*.06,h*.48,Math.min(w*.055,h*.13))+`<text x="${w*.06}" y="${h*.66}" fill="${b.palette.mutedText}" font-family="system-ui" font-size="${Math.min(w*.027,h*.06)}">${esc(b.tagline)}</text>`;
  if(a.layout==="stationery") content=image(w*.06,h*.04,w*.14)+title(w*.24,h*.11,w*.055)+`<path d="M${w*.06} ${h*.2}H${w*.94}" stroke="${b.palette.border}" stroke-width="2"/>`;
  if(a.layout==="pattern") content=`<defs><pattern id="brand" width="200" height="200" patternUnits="userSpaceOnUse">${image(25,25,150)}</pattern></defs><rect width="100%" height="100%" fill="url(#brand)"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${b.palette.background}"/>${content}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
export const BUILDER_ORIGIN = "https://website-builder-ten-psi.vercel.app";
export const SEER_ORIGIN = "https://interface-alchemy-three.vercel.app";
