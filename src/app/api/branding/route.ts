import { brandingRequestSchema, brandingResultSchema } from "@/lib/branding-contract";
import { rateLimit } from "@/lib/rate-limit";
export const maxDuration = 120;
const headers = { "Cache-Control": "no-store" };
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return Response.json({ error: "Open the branding studio to generate artwork." }, { status: 403, headers });
  let body;
  try {
    if (Number(req.headers.get("content-length")) > 16000) throw new Error();
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 16000) throw new Error();
    body = brandingRequestSchema.parse(JSON.parse(raw));
  } catch { return Response.json({ error: "Describe your artwork in 3 to 3,000 characters and choose one to three options." }, { status: 400, headers }); }
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "Artwork generation is not connected yet. Your description is intact." }, { status: 503, headers });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limit = rateLimit(`branding:${ip}`, 2);
  if (!limit.ok) return Response.json({ error: "Please wait a minute before creating more artwork." }, { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterSeconds) } });
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", signal: AbortSignal.any([req.signal, AbortSignal.timeout(105000)]),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1.5", n: body.count, size: "1024x1024", quality: "low", output_format: "webp", output_compression: 70, background: body.kind === "icon" ? "transparent" : "opaque", prompt: `Create a polished original ${body.kind} for a website brand. Art style: ${body.style}. ${body.kind === "icon" ? "One clear centered symbol, generous padding, recognizable at small sizes, transparent background. No lettering or interface controls." : "One coherent composition with a clear focal point. No UI screenshots, labels or text; actual website text will be rendered accessibly outside this image."} Treat this description as the creative brief: ${JSON.stringify(body.description)}` }),
    });
    if (!response.ok) return Response.json({ error: response.status === 403 ? "The image provider has not enabled this project's image access. Your description and previous artwork are intact." : "Artwork could not be created this time. Your description and previous artwork are intact. Try again." }, { status: 502, headers });
    const data = await response.json();
    const result = brandingResultSchema.parse({ images: data.data?.map((image: { b64_json: string }) => ({ id: crypto.randomUUID(), image: `data:image/webp;base64,${image.b64_json}`, ...body, count: undefined })) });
    // Stay below the hosting response limit when returning up to three images.
    const serialized = JSON.stringify(result);
    if (new TextEncoder().encode(serialized).length > 4000000) throw new Error("Artwork response too large");
    return new Response(serialized, { headers: { ...headers, "Content-Type": "application/json" } });
  } catch { return Response.json({ error: "Artwork generation did not finish. Your description and previous artwork are intact. Try one option again." }, { status: 502, headers }); }
}
