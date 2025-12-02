import { verifyPassword } from "@/app/lib/auth/password";
import { createSession } from "@/app/lib/auth/session";
import { toUserResponse, userLoginSchema } from "@/app/lib/db/models/User";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = userLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const { email, password } = validation.data;

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    await createSession(
      user._id!.toString(),
      user.email,
      user.name,
      user.role,
      user.googleId,
    );

    return NextResponse.json({
      success: true,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
