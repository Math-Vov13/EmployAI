import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// OTP storage (in-memory for now)
interface OTPRecord {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

// Use a global variable to persist across requests in development
const globalForOTP = globalThis as unknown as {
  otpStore: Map<string, OTPRecord>;
};

export const otpStore = globalForOTP.otpStore || new Map<string, OTPRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForOTP.otpStore = otpStore;
}

// Cleanup expired OTPs
setInterval(
  () => {
    const now = new Date();
    for (const [email, record] of otpStore.entries()) {
      if (record.expiresAt < now) {
        otpStore.delete(email);
      }
    }
  },
  5 * 60 * 1000,
);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0,
    });

    // Log OTP to terminal (for development)
    console.log("\n" + "=".repeat(50));
    console.log("🔐 OTP CODE GENERATED");
    console.log("=".repeat(50));
    console.log(`Email: ${email}`);
    console.log(`Code: ${code}`);
    console.log(`Expires: ${expiresAt.toLocaleTimeString()}`);
    console.log("=".repeat(50) + "\n");

    // Send OTP via email (Resend)
    try {
      if (
        process.env.RESEND_API_KEY &&
        process.env.RESEND_API_KEY !== "re_..."
      ) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@employai.com",
          to: email,
          subject: "Your EmployAI Verification Code",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">EmployAI</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
                  <p>Hello,</p>
                  <p>You requested a verification code to sign in to EmployAI. Use the code below:</p>
                  <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
                  </div>
                  <p><strong>This code will expire in 10 minutes.</strong></p>
                  <p>If you didn't request this code, you can safely ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    This is an automated message from EmployAI. Please do not reply to this email.
                  </p>
                </div>
              </body>
            </html>
          `,
        });
        console.log(`✅ OTP email sent to ${email}`);
      } else {
        console.log(
          "⚠️  Resend API key not configured - OTP only logged to terminal",
        );
      }
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error);
      // Don't fail if email sending fails, OTP is still valid in terminal
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
