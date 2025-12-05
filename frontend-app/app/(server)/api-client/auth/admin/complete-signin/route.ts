import { createSession } from "@/app/lib/auth/session";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { completeSignInSchema } from "@/app/lib/validations/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using schema
    const validation = completeSignInSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, rememberMe = false } = validation.data;

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user || user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    // Create session using existing session system
    await createSession(
      user._id!.toString(),
      user.email,
      user.name,
      user.role,
      user.googleId,
      rememberMe,
    );

    return NextResponse.json({
      success: true,
      message: "Sign-in complete",
    });
  } catch (error) {
    console.error("Admin complete sign-in error:", error);
    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}
