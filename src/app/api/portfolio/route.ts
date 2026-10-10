import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { portfolioMutationSchema } from "@/lib/portfolio-contract";
import { seerResultSchema } from "@/lib/seer-contract";
import { parseBrandPackage } from "@/lib/brand-package";
import { rateLimit } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
// Explicit prelaunch mode; disable this collection before enabling account portfolios.
function disabled() { return process.env.STUDIO_TEST_MODE === "false"; }
export async function GET(req: Request) {
  if (disabled()) return Response.json({ error: "The testing collection is closed." }, { status: 503, headers });
  try {
    const url = new URL(req.url), kits = url.searchParams.get("kind") === "brand-kit", community = url.searchParams.get("collection") === "community";
    const entries = await prisma.studioTestPortfolio.findMany({ where: { kind: kits ? "brand-kit" : "direction", ...(community ? { visibility: "community" } : {}) }, orderBy: { updatedAt: "desc" }, take: kits ? 10 : 100 });
    if (kits) return Response.json({ kits: entries.flatMap(entry => { try { return [parseBrandPackage(entry.data)]; } catch { return []; } }) }, { headers });
    if (community) return Response.json({ entries: entries.flatMap(entry => { const parsed = seerResultSchema.safeParse(entry.data); return parsed.success ? [{ id: entry.id, final: { ...parsed.data.final, rationale: "Community-donated visual direction available for reuse." }, donatedAt: entry.donatedAt }] : []; }) }, { headers });
    return Response.json({ entries: entries.flatMap(entry => { const parsed = seerResultSchema.safeParse(entry.data); return parsed.success ? [{ id: entry.id, result: parsed.data, visibility: entry.visibility === "community" ? "community" : "private", createdAt: entry.createdAt }] : []; }) }, { headers });
  } catch { return Response.json({ error: "The studio portfolio could not be opened. Your saved designs are intact." }, { status: 503, headers }); }
}
export async function POST(req: Request) {
  if (disabled()) return Response.json({ error: "The testing collection is closed." }, { status: 503, headers });
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return Response.json({ error: "Open the studio to update this collection." }, { status: 403, headers });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`test-portfolio:${ip}`,20).ok) return Response.json({ error: "Please wait a minute and try again." }, { status: 429, headers });
  let body;
  try { if (Number(req.headers.get("content-length")) > 2000000) throw Error(); const raw = await req.text(); if (new TextEncoder().encode(raw).length > 2000000) throw Error(); body = JSON.parse(raw); }
  catch { return Response.json({ error: "The portfolio request is incomplete." }, { status: 400, headers }); }
  try {
    if (body?.action === "save-kit" || body?.action === "save") {
      const kit = body.action === "save-kit";
      const data = kit ? parseBrandPackage(body.kit) : portfolioMutationSchema.parse(body).action === "save" ? seerResultSchema.parse(body.result) : null;
      if (!data) throw Error();
      const fingerprint = createHash("sha256").update(JSON.stringify({ kind: kit ? "brand-kit" : "direction", value: kit ? { ...(data as ReturnType<typeof parseBrandPackage>), acceptedAt: undefined } : body.result.final })).digest("hex");
      const entry = await prisma.studioTestPortfolio.upsert({ where: { fingerprint }, create: { kind: kit ? "brand-kit" : "direction", fingerprint, data }, update: { data }, select: { id: true } });
      return Response.json({ saved: true, id: entry.id }, { headers });
    }
    const action = portfolioMutationSchema.parse(body);
    if (action.action === "save") throw Error();
    const entry = await prisma.studioTestPortfolio.findFirst({ where: { id: action.id, kind: "direction" } });
    if (!entry) return Response.json({ error: "This direction is not in the studio portfolio." }, { status: 404, headers });
    seerResultSchema.parse(entry.data);
    await prisma.studioTestPortfolio.update({ where: { id: entry.id }, data: action.action === "donate" ? { visibility: "community", donatedAt: new Date() } : { visibility: "studio", donatedAt: null } });
    return Response.json({ saved: true }, { headers });
  } catch { return Response.json({ error: "The portfolio could not save this change. Your current collection is intact. Review your choice and try again." }, { status: 400, headers }); }
}
