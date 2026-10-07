import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neonAuth } from "@/lib/neon-auth-server";

const NEON_AUTH_SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";
const handleNeonAuth = neonAuth.middleware({ loginUrl: "/" });

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Managed Better Auth returns a short-lived verifier to the callback URL.
  // The Neon middleware exchanges it, together with the browser's challenge
  // cookie, for the app-origin session cookies. Run that exchange before the
  // callback page renders. All other authorization in this app reads the Neon
  // session directly on the server; no second application session is needed.
  if (request.nextUrl.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) {
    return handleNeonAuth(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/complete",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
