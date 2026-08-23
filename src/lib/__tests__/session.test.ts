// @vitest-environment node

import { SignJWT } from "jose/jwt/sign";
import { describe, expect, it } from "vitest";
import { verifySessionToken } from "../edge-session";

const secret = new TextEncoder().encode(
  "test-session-secret-with-at-least-thirty-two-characters"
);
const legacyUserId = "clx1234567890abcdefghijkl";
const neonUserId = "33f16a76-b2fc-42e3-a77e-09d91dba8f14";

async function signClaims(
  claims: Record<string, unknown>,
  expiresIn: string | number = "1h"
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

describe("verifySessionToken", () => {
  it("accepts a legacy application user id", async () => {
    const token = await signClaims({
      userId: legacyUserId,
      email: "user@example.com",
    });

    await expect(verifySessionToken(token, secret)).resolves.toMatchObject({
      userId: legacyUserId,
      email: "user@example.com",
    });
  });

  it("accepts a Neon UUID user id", async () => {
    const token = await signClaims({
      userId: neonUserId,
      email: "neon@example.com",
    });

    await expect(verifySessionToken(token, secret)).resolves.toMatchObject({
      userId: neonUserId,
      email: "neon@example.com",
    });
  });

  it("rejects invalid tokens", async () => {
    await expect(verifySessionToken("not-a-jwt", secret)).resolves.toBeNull();
  });

  it("rejects malformed JWT claims", async () => {
    const token = await signClaims({ userId: 123, email: "not-an-email" });
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("rejects an empty user id", async () => {
    const token = await signClaims({ userId: "   ", email: "user@example.com" });
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("rejects expired sessions", async () => {
    const token = await signClaims(
      { userId: legacyUserId, email: "user@example.com" },
      Math.floor(Date.now() / 1000) - 60
    );
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });
});
