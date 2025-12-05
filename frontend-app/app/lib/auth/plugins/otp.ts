import { BetterAuthPlugin } from "better-auth";

/**
 * OTP Plugin for Better Auth
 *
 * NOTE: This plugin is currently not used. OTP functionality is handled
 * by custom route handlers in /api-client/auth/send-otp and /api-client/auth/verify-otp
 *
 * This file is kept for reference and future use if needed.
 */
export const otpPlugin = (): BetterAuthPlugin => ({
  id: "otp-mfa",
  // OTP functionality is implemented via custom route handlers
  // See: app/(server)/api-client/auth/send-otp/route.ts
  // See: app/(server)/api-client/auth/verify-otp/route.ts
});
