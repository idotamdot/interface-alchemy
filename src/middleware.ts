import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { neonAuth } from "@/lib/neon-auth-server";

const NEON_AUTH_SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";
const CHALLENGE_COOKIE = "__Secure-neon-auth.session_challenge";
const LEGACY_CHALLENGE_COOKIE = "__Secure-neon-auth.session_challange";

function callbackFailure(request: NextRequest, error: string) {
  const failure = new URL("/auth/complete", request.url);
  failure.searchParams.set("error", error);
  return NextResponse.redirect(failure);
}
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
    const canonicalChallenge = request.cookies.get(CHALLENGE_COOKIE);
    const legacyChallenge = request.cookies.get(LEGACY_CHALLENGE_COOKIE);
    if (!canonicalChallenge && !legacyChallenge) {
      return callbackFailure(request, "SESSION_CHALLENGE_MISSING");
    }
    // SDK 0.4.2-beta recognizes only the legacy spelling. Retain the canonical
    // cookie for upstream verification and add an in-memory alias for the SDK.
    // Never mint a browser cookie or substitute a challenge from another login.
    let exchangeRequest = request;
    if (canonicalChallenge && !legacyChallenge) {
      const headers = new Headers(request.headers);
      headers.set("cookie", `${headers.get("cookie") ?? ""}; ${LEGACY_CHALLENGE_COOKIE}=${canonicalChallenge.value}`);
      exchangeRequest = new NextRequest(request.url, { headers });
    }
    const response = await handleNeonAuth(exchangeRequest);
    const location = response.headers.get("location");
    if (location && new URL(location, request.url).pathname === "/auth/sign-in") {
      return callbackFailure(request, "SESSION_EXCHANGE_FAILED");
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

