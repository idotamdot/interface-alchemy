import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET, POST } from "@/app/api/portfolio/route";
import { getCurrentAppUser } from "../current-user";
import { prisma } from "../prisma";
import { __resetRateLimit } from "../rate-limit";
vi.mock("../current-user", () => ({ getCurrentAppUser: vi.fn() }));
vi.mock("../prisma", () => ({ prisma: { studioTestPortfolio: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), upsert: vi.fn() } } }));
const final = { name: "Safe", direction: "Clear", rationale: "Readable", palette: { background: "#ffffff", text: "#000000", mutedText: "#333333", accent: "#ffff00", accentText: "#000000", border: "#000000" } };
const result = { proposal: final, critique: "PRIVATE CLIENT INFORMATION", final };
const mutation = (body: unknown) => new Request("https://studio.example/api/portfolio", { method: "POST", headers: { origin: "https://studio.example" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); __resetRateLimit(); vi.mocked(getCurrentAppUser).mockResolvedValue({ id: "owner", email: "owner@example.invalid", createdAt: new Date() }); });
afterEach(() => vi.restoreAllMocks());
test("community reads exclude identities and private deliberation", async () => {
  vi.mocked(prisma.studioTestPortfolio.findMany).mockResolvedValue([{ id: "design", data: result, donatedAt: new Date() }] as never);
  const response = await GET(new Request("https://studio.example/api/portfolio?collection=community"));
  const text = await response.text();
  expect(text).not.toContain("PRIVATE CLIENT");
  expect(text).not.toContain("owner");
  expect(getCurrentAppUser).not.toHaveBeenCalled();
  expect(prisma.studioTestPortfolio.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { kind: "direction", visibility: "community" } }));
});
test("anonymous testing saves to the shared studio collection", async () => {
  vi.mocked(getCurrentAppUser).mockResolvedValue(null);
  vi.mocked(prisma.studioTestPortfolio.upsert).mockResolvedValue({ id: "new" } as never);
  expect((await POST(mutation({ action: "save", result }))).status).toBe(200);
  expect(getCurrentAppUser).not.toHaveBeenCalled();
  expect(prisma.studioTestPortfolio.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ kind: "direction", data: result }) }));
});
test("donation requires explicit consent and a saved direction", async () => {
  expect((await POST(mutation({ action: "donate", id: "other", consent: false }))).status).toBe(400);
  vi.mocked(prisma.studioTestPortfolio.findFirst).mockResolvedValue(null);
  expect((await POST(mutation({ action: "donate", id: "other", consent: true }))).status).toBe(404);
  expect(prisma.studioTestPortfolio.findFirst).toHaveBeenCalledWith({ where: { id: "other", kind: "direction" } });
  expect(prisma.studioTestPortfolio.update).not.toHaveBeenCalled();
});
test("withdraw keeps the saved design and removes only public visibility", async () => {
  vi.mocked(prisma.studioTestPortfolio.findFirst).mockResolvedValue({ id: "mine", data: result } as never);
  expect((await POST(mutation({ action: "withdraw", id: "mine" }))).status).toBe(200);
  expect(prisma.studioTestPortfolio.update).toHaveBeenCalledWith({ where: { id: "mine" }, data: { visibility: "studio", donatedAt: null } });
});
