import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { POST } from "../route";
import { __resetRateLimit } from "@/lib/rate-limit";
beforeEach(()=>{__resetRateLimit();vi.stubEnv('OPENAI_API_KEY','test-key');});afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
const body={name:'Copper Bird',tagline:'Create together',source:{id:'art-1',image:'data:image/webp;base64,YWJj',alt:'Copper bird',style:'Geometric'}};
const req=(value=body)=>new Request('https://studio.example/api/brand-kit',{method:'POST',headers:{origin:'https://studio.example'},body:JSON.stringify(value)});
test('image inspection yields all asset layouts and repairs weak foreground contrast',async()=>{
 const fetchMock=vi.fn().mockResolvedValue(Response.json({choices:[{message:{content:JSON.stringify({inspiration:'Copper angles and pink glass',voice:'Warm and creative',heading:'ui-serif',palette:{background:'#FFFFFF',text:'#FFFFFF',mutedText:'#FFFFFF',accent:'#FFC030',accentText:'#FFFFFF',border:'#FFFFFF'}})}}]}));vi.stubGlobal('fetch',fetchMock);
 const response=await POST(req());expect(response.status).toBe(200);const {kit}=await response.json();expect(kit.branding.assets).toHaveLength(18);expect(kit.branding.palette.text).toBe('#000000');
 expect(JSON.parse(fetchMock.mock.calls[0][1].body).messages[1].content[1].image_url.url).toBe(body.source.image);
});
test('unsafe sources never reach provider and failures preserve accepted artwork',async()=>{
 const fetchMock=vi.fn().mockRejectedValue(Error('secret'));vi.stubGlobal('fetch',fetchMock);
 expect((await POST(req({...body,source:{...body.source,image:'https://example.com'}}))).status).toBe(400);expect(fetchMock).not.toHaveBeenCalled();
 const response=await POST(req());expect(response.status).toBe(502);expect(await response.text()).toContain('previous kit are intact');
});
