// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/neon-auth-server", async () => {
  const { createNeonAuth } = await import("@neondatabase/auth/next/server");
  return { neonAuth: createNeonAuth({
    baseUrl: "https://auth.example/auth",
    cookies: { secret: "test-cookie-secret-that-is-at-least-32-characters", sameSite: "lax" },
  }) };
});
import { middleware } from "../../middleware";

afterEach(() => vi.unstubAllGlobals());

it("exchanges a canonical challenge through the installed Neon SDK", async () => {
  const fetchMock = vi.fn().mockImplementation(async () => new Response("null", {
    status: 200,
    headers: { "content-type": "application/json", "set-cookie": "__Secure-neon-auth.session_token=test-session; Path=/; HttpOnly; Secure" },
  }));
  vi.stubGlobal("fetch", fetchMock);
  const response = await middleware(new NextRequest(
    "https://alchemy.example/auth/complete?neon_auth_session_verifier=test-verifier",
    { headers: { cookie: "__Secure-neon-auth.session_challenge=test-challenge" } },
  ));
  expect(fetchMock).toHaveBeenCalled();
  const [url, options] = fetchMock.mock.calls[0];
  expect(String(url)).toContain("get-session?neon_auth_session_verifier=test-verifier");
  expect(options.headers.get("cookie")).toContain("__Secure-neon-auth.session_challenge=test-challenge");
  expect(response.headers.get("location")).toBe("https://alchemy.example/auth/complete");
  expect(response.headers.get("set-cookie")).toContain("__Secure-neon-auth.session_token=test-session");
});
