import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { deliberateDirection } from "@/lib/seer";
export const maxDuration = 120;
const requestSchema = z.object({ brief: z.string().trim().max(8000), count: z.number().int().min(1).max(3).default(3) }).strict();
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limit = rateLimit(`seer:${ip}`, 3);
  if (!limit.ok) return Response.json({ error: "Please wait a minute before asking the Seer again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  let body;
  try {
    if (Number(req.headers.get("content-length")) > 35000) throw new Error();
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 35000) throw new Error();
    body = requestSchema.parse(JSON.parse(raw));
  } catch { return Response.json({ error: "Use a brief of 8,000 characters or fewer." }, { status: 400 }); }
  if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY) return Response.json({ error: "The Seer's two AI connections are not ready. Your draft is intact." }, { status: 503 });
  try {
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(105000)]);
    const approaches = ["bold editorial with expressive hierarchy", "calm tactile with spacious structure", "playful geometric with confident rhythm"];
    const results = await Promise.all(approaches.slice(0, body.count).map(approach => deliberateDirection(`${body.brief || "Explore an original, accessible website visual direction."}\nExplore this distinct approach: ${approach}. Creative seed: ${crypto.randomUUID()}`, signal)));
    return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof z.ZodError ? "SEER_CONTRACT_OR_CONTRAST" : error instanceof Error && /^SEER_[A-Z_]+_[0-9]+$/.test(error.message) ? error.message : error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "SEER_TIMEOUT" : "SEER_INVALID_RESPONSE";
    console.warn("Seer review failed", { code });
    return Response.json({ code, error: "The Seer could not complete its review with verified palette contrast. Your draft is intact. Try again." }, { status: 502 });
  }
}
