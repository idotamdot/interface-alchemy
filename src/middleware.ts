import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRequestSession } from "@/lib/edge-session";
import { neonAuth } from "@/lib/neon-auth-server";

const NEON_AUTH_SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";
const handleNeonAuth = neonAuth.middleware({ loginUrl: "/auth/sign-in" });

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Neon Auth completes cross-origin auth handoffs by returning a verifier in
  // the callback URL. Its middleware exchanges that verifier plus the browser's
  // challenge cookie for the actual Neon session cookies on this app origin.
  //
  // Do this only for the handoff request so Interface Alchemy keeps its existing
  // public-route behavior and its separate application JWT protection model.
  if (request.nextUrl.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) {
    return handleNeonAuth(request);
  }

  const session = await verifyRequestSession(request);

  // Protected routes that require the Interface Alchemy application session.
  const protectedPaths = ["/api/projects", "/api/filesystem"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
