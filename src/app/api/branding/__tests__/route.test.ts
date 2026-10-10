import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { POST } from "../route";
import { __resetRateLimit } from "@/lib/rate-limit";
beforeEach(() => { __resetRateLimit(); vi.stubEnv("OPENAI_API_KEY", "test-key"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const request = (body: unknown, origin = "https://studio.example") => new Request("https://studio.example/api/branding", { method: "POST", headers: { origin }, body: JSON.stringify(body) });
const brief = { description: "Copper hummingbird", style: "Geometric", kind: "icon", count: 1 };
test("rejects cross-origin generation and more than three choices before calling provider", async () => {
  const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
  expect((await POST(request(brief, "https://other.example"))).status).toBe(403);
  expect((await POST(request({ ...brief, count: 4 }))).status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});
test("returns actual image data with contract metadata and requests transparent icons", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: [{ b64_json: "YWJj" }] })); vi.stubGlobal("fetch", fetchMock);
  const response = await POST(request(brief));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect((await response.json()).images[0]).toMatchObject({ image: "data:image/webp;base64,YWJj", description: brief.description, kind: "icon" });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ background: "transparent", n: 1, output_format: "webp" });
});
test("provider failures return recovery without exposing upstream details", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("sensitive upstream detail", { status: 403 })));
  const response = await POST(request(brief));
  expect(response.status).toBe(502);
  const text = await response.text(); expect(text).toContain("previous artwork are intact"); expect(text).not.toContain("sensitive");
});
