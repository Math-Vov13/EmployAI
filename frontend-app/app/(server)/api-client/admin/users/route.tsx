import { getCurrentUser, requireAdmin } from "@/app/lib/auth/middleware";
import { hashPassword } from "@/app/lib/auth/password";
import { passwordSchema, toUserResponse } from "@/app/lib/db/models/User";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

// Admin user creation schema
const adminUserCreateSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = adminUserCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { email, password, name, role } = validationResult.data;

    const usersCollection = await getUsersCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    if (!createdUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: toUserResponse(createdUser),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
