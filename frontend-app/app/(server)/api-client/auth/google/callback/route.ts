import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from "@/app/lib/auth/google-oauth";
import { generateRandomPassword, hashPassword } from "@/app/lib/auth/password";
import { createSession } from "@/app/lib/auth/session";
import { UserDocument } from "@/app/lib/db/models/User";
import { getUsersCollection } from "@/app/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Google authentication failed")}`,
          request.url,
        ),
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Missing authorization code")}`,
          request.url,
        ),
      );
    }

    const { access_token } = await exchangeCodeForTokens(code);
    const googleUser = await getGoogleUserInfo(access_token);

    if (!googleUser.verified_email) {
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Email not verified with Google")}`,
          request.url,
        ),
      );
    }

    const usersCollection = await getUsersCollection();
    let user = await usersCollection.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.id }],
    });

    if (!user) {
      const randomPassword = generateRandomPassword();
      const hashedPassword = await hashPassword(randomPassword);

      const newUser: Omit<UserDocument, "_id"> = {
        email: googleUser.email,
        password: hashedPassword, // on store tt de meme
        name: googleUser.name || googleUser.email.split("@")[0],
        role: "USER",
        googleId: googleUser.id,
        picture: googleUser.picture,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            ...(user.googleId ? {} : { googleId: googleUser.id }),
            ...(user.picture !== googleUser.picture
              ? { picture: googleUser.picture }
              : {}),
          },
        },
      );
    }

    // Google OAuth users get persistent 7-day sessions by default
    // (they can sign in easily with Google anyway, so Remember Me makes sense)
    await createSession(
      user._id!.toString(),
      user.email,
      user.name,
      user.role,
      googleUser.id,
      true, // rememberMe = true for OAuth users
    );

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent("Authentication failed. Please try again.")}`,
        request.url,
      ),
    );
  }
}
