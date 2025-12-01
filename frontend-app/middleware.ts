import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (handled separately)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api-client") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return response;
  }

  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get("employai_session");
    const isLoggedIn = !!sessionCookie?.value;

    // Note: We can't decrypt the session in middleware without additional setup
    // For now, we just check if the cookie exists
    // If you need role-based protection in middleware, consider using a separate token

    // Public pages
    const publicPages = ["/sign-in", "/sign-up", "/"];
    if (publicPages.includes(pathname)) {
      // Redirect authenticated users away from auth pages
      if (isLoggedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }

    // Protected pages - require authentication
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/admin")
    ) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }

    // Note: Admin role checking happens at the API route level
    // If you need middleware-level role checking, use JWT tokens with role claims

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
