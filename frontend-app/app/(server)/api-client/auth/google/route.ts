import { getGoogleAuthUrl } from "@/app/lib/auth/google-oauth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authUrl = getGoogleAuthUrl();

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google authentication" },
      { status: 500 },
    );
  }
}
