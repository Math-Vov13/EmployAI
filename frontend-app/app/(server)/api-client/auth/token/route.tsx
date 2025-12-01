import { NextRequest, NextResponse } from "next/server";
import { userLoginSchema } from "@/app/lib/db/models/User";
import { verifyPassword } from "@/app/lib/auth/password";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { generateToken } from "@/app/lib/auth/token";

/**
 * POST /api-client/auth/token
 * Generate a JWT token for API authentication
 * Use this endpoint for mobile apps or external API access
 */
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

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    return NextResponse.json({
      success: true,
      token,
      tokenType: "Bearer",
      expiresIn: "7d",
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 },
    );
  }
}
