import { otpVerificationSchema } from "@/app/lib/validations/auth";
import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "../send-otp/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using schema
    const validation = otpVerificationSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, code } = validation.data;

    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      return NextResponse.json(
        { error: "No OTP found for this email" },
        { status: 400 },
      );
    }

    // Check if expired
    if (record.expiresAt < new Date()) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempts
    if (record.attempts >= 5) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json(
        { error: "Too many failed attempts" },
        { status: 429 },
      );
    }

    // Verify code
    if (record.code !== code) {
      record.attempts += 1;
      return NextResponse.json(
        {
          error: "Invalid OTP code",
          attemptsRemaining: 5 - record.attempts,
        },
        { status: 400 },
      );
    }

    // Success - remove OTP from store
    otpStore.delete(email.toLowerCase());

    console.log(`✅ OTP verified successfully for ${email}`);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 },
    );
  }
}
