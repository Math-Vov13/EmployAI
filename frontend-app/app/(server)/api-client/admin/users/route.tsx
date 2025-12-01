import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth/middleware";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { toUserResponse } from "@/app/lib/db/models/User";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({}).toArray();

    return NextResponse.json({
      success: true,
      users: users.map(toUserResponse),
    });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return new Response("POST /admin/users", {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
