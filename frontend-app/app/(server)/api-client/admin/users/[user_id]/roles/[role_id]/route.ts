import { requireAdmin } from "@/app/lib/auth/middleware";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; role_id: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { user_id, role_id } = await params;

    if (!ObjectId.isValid(user_id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // For this system, we'll interpret "removing a role" as downgrading to USER
    // since we only have USER and ADMIN roles
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(user_id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If trying to remove ADMIN role, downgrade to USER
    if (role_id === "ADMIN") {
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            role: "USER",
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      if (!result) {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Admin role removed, user downgraded to USER",
        userId: user_id,
        role: result.role,
      });
    }

    // If trying to remove USER role when they're already USER, nothing to do
    return NextResponse.json({
      success: true,
      message: "Role is already USER",
      userId: user_id,
      role: user.role,
    });
  } catch (error) {
    console.error("Remove user role error:", error);
    return NextResponse.json(
      { error: "Failed to remove user role" },
      { status: 500 },
    );
  }
}
