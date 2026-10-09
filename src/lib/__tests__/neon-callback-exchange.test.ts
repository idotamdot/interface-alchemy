// @vitest-environment node
import { NextRequest } from 'next/server';
import { createNeonAuth } from '@neondatabase/auth/next/server';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(()=>vi.unstubAllGlobals());
it('the installed SDK exchanges a verifier on the callback with a non-root login URL',async()=>{
 const upstream=vi.fn().mockImplementation(async()=>new Response(JSON.stringify({session:null,user:null}),{status:200,headers:{'content-type':'application/json','set-cookie':'__Secure-neon-auth.session_token=test; Path=/; HttpOnly; Secure'}}));
 vi.stubGlobal('fetch',upstream);
 const auth=createNeonAuth({baseUrl:'https://auth.example/neondb/auth',cookies:{secret:'test-only-cookie-secret-at-least-32-characters',sameSite:'lax'},logLevel:'silent'});
 const request=new NextRequest('https://alchemy.example/auth/complete?neon_auth_session_verifier=test',{headers:{cookie:'__Secure-neon-auth.session_challange=challenge'}});
 await auth.middleware({loginUrl:'/'})(request);
 expect(upstream).not.toHaveBeenCalled();
 const response=await auth.middleware({loginUrl:'/auth/sign-in'})(request);
 expect(upstream).toHaveBeenCalled();
 expect(response.headers.get('location')).toBe('https://alchemy.example/auth/complete');
 expect(response.headers.get('set-cookie')).toContain('session_token');
});
