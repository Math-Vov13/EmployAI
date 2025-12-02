import { hashPassword } from "@/app/lib/auth/password";
import { createSession } from "@/app/lib/auth/session";
import {
  UserDocument,
  toUserResponse,
  userRegistrationSchema,
} from "@/app/lib/db/models/User";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = userRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = validation.data;

    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser: Omit<UserDocument, "_id"> = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userWithId = { ...newUser, _id: result.insertedId };

    await createSession(
      result.insertedId.toString(),
      userWithId.email,
      userWithId.name,
      userWithId.role,
    );

    return NextResponse.json(
      {
        success: true,
        user: toUserResponse(userWithId),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed." },
      { status: 500 },
    );
  }
}
