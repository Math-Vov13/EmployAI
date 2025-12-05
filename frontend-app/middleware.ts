import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isLoggedIn: boolean;
  googleId?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (handled separately)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api-client") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Get session
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(
      request as any,
      response as any,
      {
        password: process.env.SESSION_SECRET!,
        cookieName: process.env.SESSION_COOKIE_NAME!,
      },
    );

    const isLoggedIn = session.isLoggedIn === true;
    const isAdmin = session.role === "ADMIN";

    // Public pages (accessible to everyone)
    const publicPages = ["/", "/sign-in"];

    // Admin auth pages
    if (pathname.startsWith("/admin/sign-in")) {
      // If already logged in as admin, redirect to admin dashboard
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    // Regular auth pages
    if (pathname === "/sign-in") {
      // If already logged in, redirect based on role
      if (isLoggedIn) {
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }

    // Landing page
    if (pathname === "/") {
      return response;
    }

    // Admin routes - require admin role
    if (pathname.startsWith("/admin")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/sign-in", request.url));
      }
      if (!isAdmin) {
        // Logged in but not admin - forbidden
        return NextResponse.redirect(
          new URL("/dashboard?error=forbidden", request.url),
        );
      }
      return response;
    }

    // User routes - require authentication
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/chat")
    ) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      // If admin tries to access user routes, allow it (admins can see everything)
      return response;
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
