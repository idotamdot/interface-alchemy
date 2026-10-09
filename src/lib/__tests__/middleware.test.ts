// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { handler, configure } = vi.hoisted(() => ({
 handler: vi.fn(),
 configure: vi.fn(),
}));
vi.mock("@/lib/neon-auth-server", () => ({
 neonAuth: { middleware: configure.mockImplementation(() => handler) },
}));
import { middleware } from "../../middleware";

describe("Neon callback middleware", () => {
 beforeEach(() => handler.mockReset());
 it("does not classify the callback as the login page", () => {
  const { loginUrl } = configure.mock.calls[0][0];
  expect('/auth/complete'.startsWith(loginUrl)).toBe(false);
 });
 it("passes the verifier and challenge to Neon and preserves the exchange response", async () => {
  const response=new Response(null,{status:302,headers:{location:'/auth/complete','set-cookie':'session=example; HttpOnly; Secure'}});
  handler.mockResolvedValue(response);
  const request=new NextRequest('https://alchemy.example/auth/complete?neon_auth_session_verifier=test-verifier', {headers:{cookie:'__Secure-neon-auth.session_challange=test-challenge'}});
  expect(await middleware(request)).toBe(response);
  expect(handler).toHaveBeenCalledWith(request);
 });
 it("reports a failed exchange without redirecting to a missing login route", async () => {
  handler.mockResolvedValue(new Response(null,{status:302,headers:{location:'https://alchemy.example/auth/sign-in'}}));
  const response=await middleware(new NextRequest('https://alchemy.example/auth/complete?neon_auth_session_verifier=test', {headers:{cookie:'__Secure-neon-auth.session_challange=test-challenge'}}));
  expect(response.headers.get('location')).toBe('https://alchemy.example/auth/complete?error=SESSION_EXCHANGE_FAILED');
 });
 it("aliases the canonical challenge for the installed SDK while preserving upstream cookies", async () => {
  handler.mockResolvedValue(new Response(null));
  await middleware(new NextRequest('https://alchemy.example/auth/complete?neon_auth_session_verifier=test', {headers:{cookie:'__Secure-neon-auth.session_challenge=canonical; unrelated=keep'}}));
  const request = handler.mock.calls[0][0] as NextRequest;
  expect(request.cookies.get('__Secure-neon-auth.session_challenge')?.value).toBe('canonical');
  expect(request.cookies.get('__Secure-neon-auth.session_challange')?.value).toBe('canonical');
  expect(request.cookies.get('unrelated')?.value).toBe('keep');
 });
 it("reports a missing browser challenge without attempting an exchange", async () => {
  const response=await middleware(new NextRequest('https://alchemy.example/auth/complete?neon_auth_session_verifier=test'));
  expect(response.headers.get('location')).toBe('https://alchemy.example/auth/complete?error=SESSION_CHALLENGE_MISSING');
  expect(handler).not.toHaveBeenCalled();
 });
 it("leaves anonymous work and public auth requests accessible", async () => {
  for(const path of ['/', '/auth/complete', '/api/auth/status', '/api/auth/sign-in/magic-link']) {
   const response=await middleware(new NextRequest('https://alchemy.example'+path));
   expect(response.headers.get('x-middleware-next')).toBe('1');
  }
  expect(handler).not.toHaveBeenCalled();
 });
});
