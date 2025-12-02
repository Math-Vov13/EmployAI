import { BetterAuthPlugin } from "better-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// OTP storage (in-memory for now, could move to Redis/MongoDB later)
interface OTPRecord {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

// Cleanup expired OTPs every 5 minutes
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

/**
 * Generate a random 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * OTP Plugin for Better Auth
 * Provides email-based OTP verification for MFA
 *
 * NOTE: This plugin is currently not used. OTP functionality is handled
 * by custom route handlers in /api-client/auth/send-otp and /api-client/auth/verify-otp
 */
export const otpPlugin = (): BetterAuthPlugin => ({
  id: "otp-mfa",
  endpoints: {
    "/send-otp": {
      method: ["POST"],
      handler: async (ctx) => {
        const { email } = ctx.body as { email: string };

        if (!email || typeof email !== "string") {
          return ctx.json({ error: "Email is required" }, { status: 400 });
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

        return ctx.json({
          success: true,
          message: "OTP sent successfully",
          expiresIn: 600, // 10 minutes in seconds
        });
      },
    },

    "/verify-otp": {
      method: ["POST"],
      handler: async (ctx) => {
        const { email, code } = ctx.body as { email: string; code: string };

        if (!email || !code) {
          return ctx.json(
            { error: "Email and code are required" },
            { status: 400 },
          );
        }

        const record = otpStore.get(email.toLowerCase());

        if (!record) {
          return ctx.json(
            { error: "No OTP found for this email" },
            { status: 400 },
          );
        }

        // Check if expired
        if (record.expiresAt < new Date()) {
          otpStore.delete(email.toLowerCase());
          return ctx.json({ error: "OTP has expired" }, { status: 400 });
        }

        // Check attempts
        if (record.attempts >= 5) {
          otpStore.delete(email.toLowerCase());
          return ctx.json(
            { error: "Too many failed attempts" },
            { status: 429 },
          );
        }

        // Verify code
        if (record.code !== code) {
          record.attempts += 1;
          return ctx.json(
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

        return ctx.json({
          success: true,
          message: "OTP verified successfully",
        });
      },
    },
  },
});
