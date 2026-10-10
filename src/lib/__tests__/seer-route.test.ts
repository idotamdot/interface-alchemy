import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { POST } from "@/app/api/seer/route";
import { deliberateDirection } from "../seer";
import { __resetRateLimit } from "../rate-limit";
vi.mock("../seer", () => ({ deliberateDirection: vi.fn() }));
beforeEach(() => { __resetRateLimit(); vi.clearAllMocks(); vi.stubEnv("OPENAI_API_KEY", "test"); vi.stubEnv("GEMINI_API_KEY", "test"); });
afterEach(() => vi.unstubAllEnvs());
const request = (body: unknown) => new Request("https://studio.example/api/seer", { method: "POST", body: JSON.stringify(body) });
test("creates up to three independently reviewed options", async () => {
  vi.mocked(deliberateDirection).mockResolvedValue({} as Awaited<ReturnType<typeof deliberateDirection>>);
  const response = await POST(request({ brief: "A shop", count: 3 }));
  expect(response.status).toBe(200);
  expect((await response.json()).results).toHaveLength(3);
  expect(deliberateDirection).toHaveBeenCalledTimes(3);
  expect(new Set(vi.mocked(deliberateDirection).mock.calls.map(args => args[0])).size).toBe(3);
});
test("rejects extra options before calling AI", async () => {
  expect((await POST(request({ brief: "shop", count: 4 }))).status).toBe(400);
  expect(deliberateDirection).not.toHaveBeenCalled();
});
test("fails honestly when one review fails", async () => {
  vi.mocked(deliberateDirection).mockRejectedValue(new Error("bad palette"));
  const response = await POST(request({ brief: "", count: 1 }));
  expect(response.status).toBe(502);
  expect((await response.json()).error).toContain("draft is intact");
});
