// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract the cookie set by your Node.js backend
  const token = request.cookies.get('auth_token')?.value;

  // Define the routes you want to protect (or handle this in the config below)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/profile');

  if (isProtectedRoute && !token) {
    // Redirect unauthenticated users to the login page
    const loginUrl = new URL('/login', request.url);
    // Optional: Save the attempted URL so you can redirect them back after login
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed if they have a token
  return NextResponse.next();
}

// Optionally, use a matcher to optimize exactly which routes trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*', '/profile'],
};