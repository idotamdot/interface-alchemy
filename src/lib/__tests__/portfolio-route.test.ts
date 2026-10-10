import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET, POST } from "@/app/api/portfolio/route";
import { getCurrentAppUser } from "../current-user";
import { prisma } from "../prisma";
import { __resetRateLimit } from "../rate-limit";
vi.mock("../current-user", () => ({ getCurrentAppUser: vi.fn() }));
vi.mock("../prisma", () => ({ prisma: { portfolioDesign: { findMany: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(), upsert: vi.fn() } } }));
const final = { name: "Safe", direction: "Clear", rationale: "Readable", palette: { background: "#ffffff", text: "#000000", mutedText: "#333333", accent: "#ffff00", accentText: "#000000", border: "#000000" } };
const result = { proposal: final, critique: "PRIVATE CLIENT INFORMATION", final };
const mutation = (body: unknown) => new Request("https://studio.example/api/portfolio", { method: "POST", headers: { origin: "https://studio.example" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); __resetRateLimit(); vi.mocked(getCurrentAppUser).mockResolvedValue({ id: "owner", email: "owner@example.invalid", createdAt: new Date() }); });
afterEach(() => vi.restoreAllMocks());
test("community reads exclude identities and private deliberation", async () => {
  vi.mocked(prisma.portfolioDesign.findMany).mockResolvedValue([{ id: "design", userId: "owner", result, donatedAt: new Date() }] as never);
  const response = await GET(new Request("https://studio.example/api/portfolio?collection=community"));
  const text = await response.text();
  expect(text).not.toContain("PRIVATE CLIENT");
  expect(text).not.toContain("owner");
  expect(getCurrentAppUser).not.toHaveBeenCalled();
  expect(prisma.portfolioDesign.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { visibility: "community" } }));
});
test("saving requires sign-in and stays private", async () => {
  vi.mocked(getCurrentAppUser).mockResolvedValueOnce(null);
  expect((await POST(mutation({ action: "save", result }))).status).toBe(401);
  vi.mocked(prisma.portfolioDesign.upsert).mockResolvedValue({ id: "new" } as never);
  expect((await POST(mutation({ action: "save", result }))).status).toBe(200);
  expect(prisma.portfolioDesign.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ userId: "owner", result }) }));
});
test("donation requires explicit consent and owner-scoped access", async () => {
  expect((await POST(mutation({ action: "donate", id: "other", consent: false }))).status).toBe(400);
  vi.mocked(prisma.portfolioDesign.findFirst).mockResolvedValue(null);
  expect((await POST(mutation({ action: "donate", id: "other", consent: true }))).status).toBe(404);
  expect(prisma.portfolioDesign.findFirst).toHaveBeenCalledWith({ where: { id: "other", userId: "owner" } });
  expect(prisma.portfolioDesign.updateMany).not.toHaveBeenCalled();
});
test("withdraw keeps the saved design and removes only public visibility", async () => {
  vi.mocked(prisma.portfolioDesign.findFirst).mockResolvedValue({ id: "mine", result } as never);
  expect((await POST(mutation({ action: "withdraw", id: "mine" }))).status).toBe(200);
  expect(prisma.portfolioDesign.updateMany).toHaveBeenCalledWith({ where: { id: "mine", userId: "owner" }, data: { visibility: "private", donatedAt: null } });
});
