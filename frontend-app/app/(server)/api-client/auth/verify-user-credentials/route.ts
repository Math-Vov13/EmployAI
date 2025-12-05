import { verifyPassword } from "@/app/lib/auth/password";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { validateUserSignIn } from "@/app/lib/validations/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using schema
    const validation = validateUserSignIn(body);
    if (!validation.success) {
      const firstError = Object.values(validation.errors!)[0];
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = validation.data!;

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

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Credentials verified",
    });
  } catch (error) {
    console.error("User credentials verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
