import { requireOwnership } from "@/app/lib/auth/middleware";
import { toUserResponse } from "@/app/lib/db/models/User";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;

  const authError = await requireOwnership(request, user_id);
  if (authError) return authError;

  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(user_id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;

  const authError = await requireOwnership(request, user_id);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 },
      );
    }

    const usersCollection = await getUsersCollection();
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          name: name.trim(),
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
      user: toUserResponse(result),
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Fail update user" }, { status: 500 });
  }
}
