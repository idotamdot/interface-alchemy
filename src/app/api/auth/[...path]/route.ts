import type { NextRequest } from "next/server";
import { neonAuth } from "@/lib/neon-auth-server";

export const dynamic = "force-dynamic";

const authHandler = neonAuth.handler();

function normalizeChallengeCookie(cookie: string): string {
  const isChallengeCookie =
    /(?:^|;\s*)(?:__Secure-)?(?:neon[_-]?auth[_-]?)?session_chall(?:e|a)nge=/i.test(cookie) ||
    /(?:^|;\s*)session_chall(?:e|a)nge=/i.test(cookie);

  if (!isChallengeCookie) {
    return cookie;
  }

  let normalized = cookie.replace(/;\s*Partitioned/gi, "");
  if (/;\s*SameSite=/i.test(normalized)) {
    normalized = normalized.replace(/;\s*SameSite=(?:Strict|None|Lax)/i, "; SameSite=Lax");
  } else {
    normalized += "; SameSite=Lax";
  }

  return normalized;
}

function normalizeAuthResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  const getSetCookie = (
    headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie !== "function") {
    return response;
  }

  const cookies = getSetCookie.call(headers);
  if (cookies.length === 0) {
    return response;
  }

  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append("set-cookie", normalizeChallengeCookie(cookie));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return normalizeAuthResponse(await authHandler.GET(request));
}

export async function POST(request: NextRequest): Promise<Response> {
  return normalizeAuthResponse(await authHandler.POST(request));
}
