import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

function isAuthCookieName(name: string): boolean {
  const normalized = name.toLowerCase();
  return (
    normalized.includes("neon-auth") ||
    normalized.includes("better-auth") ||
    normalized.includes("session")
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const authCookieNames = cookieStore
      .getAll()
      .map(({ name }) => name)
      .filter(isAuthCookieName);

    const user = await getCurrentAppUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          diagnostic:
            authCookieNames.length > 0
              ? "SESSION_COOKIE_PRESENT_BUT_INVALID"
              : "SESSION_COOKIE_MISSING",
          authCookieNames,
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Neon Auth is the only session authority. Server actions and project
    // loaders verify this same managed session directly, so minting a second
    // application JWT here would only create another failure boundary.
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Auth status resolution failed", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "AUTH_STATUS_FAILED",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
