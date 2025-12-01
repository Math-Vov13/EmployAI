import { NextRequest, NextResponse } from "next/server";
import { getSession, getCurrentUser } from "./session";
import { extractTokenFromHeader, verifyToken } from "./token";

/**
 * Get authentication context from either session or token
 * Tries session first, then falls back to JWT token from Authorization header
 */
async function getAuthContext(request: NextRequest) {
  // Try session first
  const session = await getSession();
  if (session.isLoggedIn) {
    return {
      isAuthenticated: true,
      userId: session.userId,
      email: session.email,
      role: session.role,
      name: session.name,
      googleId: session.googleId,
      authType: "session" as const,
    };
  }

  // Try token if session not found
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return {
        isAuthenticated: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        authType: "token" as const,
      };
    }
  }

  return {
    isAuthenticated: false,
    authType: null,
  };
}

export async function requireAuth(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized - login required" },
      { status: 401 },
    );
  }

  return null;
}

export async function requireAdmin(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized - login required" },
      { status: 401 },
    );
  }

  if (auth.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin Access Required" },
      { status: 403 },
    );
  }

  return null;
}

export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string,
) {
  const auth = await getAuthContext(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized - login required" },
      { status: 401 },
    );
  }

  if (auth.role === "ADMIN") {
    return null;
  }

  if (auth.userId !== resourceUserId) {
    return NextResponse.json(
      { error: "Forbidden - Can only access your own resources" },
      { status: 403 },
    );
  }

  return null;
}

export { getCurrentUser, getAuthContext };
