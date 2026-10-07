// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Neon auth middleware boundary", () => {
  it("uses Managed Better Auth as the callback/session authority", () => {
    const middleware = readFileSync(resolve(process.cwd(), "src/middleware.ts"), "utf8");
    const serverAuth = readFileSync(
      resolve(process.cwd(), "src/lib/neon-auth-server.ts"),
      "utf8"
    );
    const statusRoute = readFileSync(
      resolve(process.cwd(), "src/app/api/auth/status/route.ts"),
      "utf8"
    );

    expect(middleware).toContain("neonAuth.middleware");
    expect(middleware).toContain("neon_auth_session_verifier");
    expect(middleware).not.toContain("verifyRequestSession");
    expect(serverAuth).toContain("createNeonAuth");
    expect(serverAuth).toContain("NEON_AUTH_COOKIE_SECRET");
    expect(statusRoute).toContain("getCurrentAppUser");
    expect(statusRoute).not.toContain("createSession");
  });
});
