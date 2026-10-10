import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { portfolioMutationSchema } from "@/lib/portfolio-contract";
import { directionSchema, seerResultSchema } from "@/lib/seer-contract";
import { rateLimit } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET(req: Request) {
  try {
    if (new URL(req.url).searchParams.get("collection") === "community") {
      const entries = await prisma.portfolioDesign.findMany({ where: { visibility: "community" }, orderBy: { donatedAt: "desc" }, take: 60, select: { id: true, result: true, donatedAt: true } });
      // Only publish the selected visual direction. Never publish identities, briefs or deliberation.
      return Response.json({ entries: entries.flatMap(entry => {
        const parsed = seerResultSchema.safeParse(entry.result);
        return parsed.success ? [{ id: entry.id, final: { name: parsed.data.final.name, direction: parsed.data.final.direction, palette: parsed.data.final.palette, rationale: "Community-donated visual direction available for reuse." }, donatedAt: entry.donatedAt }] : [];
      }) }, { headers });
    }
    const user = await getCurrentAppUser();
    if (!user) return Response.json({ error: "Sign in to open your private portfolio." }, { status: 401, headers });
    const entries = await prisma.portfolioDesign.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, result: true, visibility: true, createdAt: true } });
    return Response.json({ entries }, { headers });
  } catch { return Response.json({ error: "The portfolio could not load. Try again." }, { status: 503, headers }); }
}
export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403, headers });
    const user = await getCurrentAppUser();
    if (!user) return Response.json({ error: "Sign in to save or donate designs." }, { status: 401, headers });
    if (!rateLimit(`portfolio:${user.id}`, 20).ok) return Response.json({ error: "Please wait before updating your portfolio again." }, { status: 429, headers });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 35000) return Response.json({ error: "Design is too large." }, { status: 413, headers });
    const parsed = portfolioMutationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return Response.json({ error: "A valid design and explicit sharing consent are required." }, { status: 400, headers });
    const body = parsed.data;
    if (body.action === "save") {
      const fingerprint = createHash("sha256").update(JSON.stringify(body.result.final)).digest("hex");
      const entry = await prisma.portfolioDesign.upsert({ where: { userId_fingerprint: { userId: user.id, fingerprint } }, create: { userId: user.id, fingerprint, result: body.result }, update: {}, select: { id: true, result: true, visibility: true, createdAt: true } });
      return Response.json({ entry }, { headers });
    }
    const entry = await prisma.portfolioDesign.findFirst({ where: { id: body.id, userId: user.id } });
    if (!entry) return Response.json({ error: "Design not found in your portfolio." }, { status: 404, headers });
    if (body.action === "donate") {
      const stored = seerResultSchema.parse(entry.result);
      directionSchema.parse(stored.final);
    }
    // Owner check is part of the update, not just an earlier read.
    await prisma.portfolioDesign.updateMany({ where: { id: body.id, userId: user.id }, data: body.action === "donate" ? { visibility: "community", donatedAt: new Date() } : { visibility: "private", donatedAt: null } });
    return Response.json({ success: true }, { headers });
  } catch { return Response.json({ error: "The portfolio could not save this change. Your existing designs are intact." }, { status: 503, headers }); }
}
