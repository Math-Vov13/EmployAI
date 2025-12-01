import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth/middleware";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { user_id } = await params;

    if (!ObjectId.isValid(user_id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 },
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(user_id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user's current role
    return NextResponse.json({
      success: true,
      userId: user_id,
      role: user.role || "USER",
    });
  } catch (error) {
    console.error("Get user roles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { user_id } = await params;

    if (!ObjectId.isValid(user_id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 },
      );
    }

    const usersCollection = await getUsersCollection();
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          role: role,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      userId: user_id,
      role: result.role,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
