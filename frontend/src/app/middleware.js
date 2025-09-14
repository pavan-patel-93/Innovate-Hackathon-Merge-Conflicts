// Middleware for authentication
import { NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/api/documents',
  '/api/ai',
];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ['/login', '/signup'];

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the session cookie
  const sessionCookie = request.cookies.get('session_id');
  
  // Check if the path is protected and requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // Check if the path is an auth path (login/signup)
  const isAuthPath = authPaths.some(path => pathname === path);
  
  // If accessing a protected path without a session cookie, redirect to login
  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing auth paths with a session cookie, redirect to dashboard
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For all other paths, continue with the request
  return NextResponse.next();
}

/*
LIMITATIONS OF CHECKING SESSIONS IN MIDDLEWARE:

1. Middleware runs before the route handlers, so it can only check for the existence
   of the session cookie, not its validity in Redis. A deleted or expired Redis key 
   would still have a cookie that passes middleware checks.

2. The Redis check requires an async function, but middleware can't use async/await
   directly. A workaround would be to use Edge Runtime if full session validation
   is needed at the middleware level.

3. For complete security, route handlers should still verify the session by checking
   Redis to ensure the session is still valid, even if the middleware allowed the request.

4. This implementation redirects based on the cookie presence alone, which is efficient 
   but not fully secure. It's best combined with proper session validation in the API routes.
*/

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match authentication routes
    '/login',
    '/signup',
    // Match protected routes
    '/dashboard',
    // Exclude files with extensions (static assets)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};