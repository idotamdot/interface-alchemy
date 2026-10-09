import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neonAuth } from "@/lib/neon-auth-server";

const NEON_AUTH_SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";
// The SDK skips every pathname starting with loginUrl. Using "/" disables
// verifier exchange on every route, including /auth/complete. Ordinary requests
// bypass this handler below; this fallback is used only for failed callbacks.
const handleNeonAuth = neonAuth.middleware({ loginUrl: "/auth/sign-in" });

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Managed Better Auth returns a short-lived verifier to the callback URL.
  // The Neon middleware exchanges it, together with the browser's challenge
  // cookie, for the app-origin session cookies. Run that exchange before the
  // callback page renders. All other authorization in this app reads the Neon
  // session directly on the server; no second application session is needed.
  if (request.nextUrl.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) {
    const response = await handleNeonAuth(request);
    const location = response.headers.get("location");
    if (location && new URL(location, request.url).pathname === "/auth/sign-in") {
      const failure = new URL("/auth/complete", request.url);
      failure.searchParams.set("error", "SESSION_EXCHANGE_FAILED");
      return NextResponse.redirect(failure);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/complete",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

