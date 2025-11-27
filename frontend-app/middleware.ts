import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'employai.session';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/verify-otp',
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin-secret',
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Redirect to login if no session
  if (!sessionToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // For admin routes, we'll need to verify the role on the server side
  // The middleware just checks for session presence
  // Admin role verification happens in the API routes themselves

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
