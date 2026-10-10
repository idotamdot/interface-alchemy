import { expect, test } from "vitest";
import { BRAND_LAYOUTS, parseBrandPackage, renderBrandAsset } from "../brand-package";
const input = () => ({ format:"screen-seer-build/v1",acceptedAt:"2026-10-10T04:00:00.000Z",branding:{name:'Copper <script>alert(1)</script>',tagline:'Create & connect',source:{id:'art-1',image:'data:image/webp;base64,YWJj',alt:'Copper bird',style:'Geometric'},palette:{background:'#FFFFFF',text:'#000000',mutedText:'#333333',accent:'#000000',accentText:'#FFFFFF',border:'#555555'},typography:{heading:'system-ui',body:'system-ui',minimumBodyPx:18},inspiration:'Copper shapes and pink glass.',voice:'Warm and clear',guidelines:['Keep readable labels.'],assets:BRAND_LAYOUTS}});
test("kit carries every standard layout and its original art through a round trip",()=>{
 const pkg=parseBrandPackage(JSON.parse(JSON.stringify(input())));expect(pkg.branding.assets).toHaveLength(18);expect(pkg.branding.source.id).toBe('art-1');
 for(const asset of BRAND_LAYOUTS){ const svg=decodeURIComponent(renderBrandAsset(pkg,asset.role).split(',').slice(1).join(','));expect(svg).toContain(`width="${asset.width}"`);expect(svg).not.toContain('<script>'); }
});
test("receiver rejects unsafe image sources, changed asset recipes and inaccessible colors",()=>{
 const image=input();image.branding.source.image='https://tracking.example/image';expect(()=>parseBrandPackage(image)).toThrow();
 const colors=input();colors.branding.palette.text='#FFFFFF';expect(()=>parseBrandPackage(colors)).toThrow();
 expect(()=>parseBrandPackage({...input(),branding:{...input().branding,assets:[]}})).toThrow();
});
test("unknown fields are excluded from the approved snapshot",()=>{
 const pkg=parseBrandPackage({...input(),execute:'evil',branding:{...input().branding,markup:'evil'}});expect(pkg).not.toHaveProperty('execute');expect(pkg.branding).not.toHaveProperty('markup');
});
