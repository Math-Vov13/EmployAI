import { NextRequest, NextResponse } from "next/server";
import { getSession, getCurrentUser } from "./session";

export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Unauthorized - login" },
      { status: 401 },
    );
  }

  return null;
}

export async function requireAdmin(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Unauthorized - login" },
      { status: 401 },
    );
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin Access" },
      { status: 403 },
    );
  }

  return null;
}

export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string,
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized - login" },
      { status: 401 },
    );
  }

  if (currentUser.role === "ADMIN") {
    return null;
  }

  if (currentUser.userId !== resourceUserId) {
    return NextResponse.json(
      { error: "Forbidden - Unique acces a vos ressources" },
      { status: 403 },
    );
  }

  return null;
}

export { getCurrentUser };
