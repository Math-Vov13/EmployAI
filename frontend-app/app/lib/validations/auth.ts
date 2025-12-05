import { z } from "zod";

/**
 * Email validation schema
 * - Must be a valid email format
 * - Case-insensitive
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .toLowerCase()
  .trim();

/**
 * Password validation schema for sign-in
 * - Minimum 12 characters
 * - No other requirements for sign-in (only for registration)
 */
export const signInPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(12, "Password must be at least 12 characters");

/**
 * Remember Me validation schema
 * - Boolean value
 * - Defaults to false if not provided
 */
export const rememberMeSchema = z.boolean().default(false);

/**
 * User Sign-In Schema
 * Used for regular user authentication
 */
export const userSignInSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
  rememberMe: rememberMeSchema.optional(),
});

/**
 * Admin Sign-In Schema
 * Used for admin authentication
 * Same as user sign-in but semantically different endpoint
 */
export const adminSignInSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
  rememberMe: rememberMeSchema.optional(),
});

/**
 * OTP Verification Schema
 * Used for verifying OTP codes
 */
export const otpVerificationSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .length(6, "OTP code must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
});

/**
 * Complete Sign-In Schema
 * Used when creating the session after OTP verification
 */
export const completeSignInSchema = z.object({
  email: emailSchema,
  rememberMe: rememberMeSchema.optional(),
});

// Type exports for TypeScript
export type UserSignInInput = z.infer<typeof userSignInSchema>;
export type AdminSignInInput = z.infer<typeof adminSignInSchema>;
export type OTPVerificationInput = z.infer<typeof otpVerificationSchema>;
export type CompleteSignInInput = z.infer<typeof completeSignInSchema>;

/**
 * Helper function to validate email only
 */
export function validateEmail(email: string): {
  success: boolean;
  error?: string;
} {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid email",
    };
  }
  return { success: true };
}

/**
 * Helper function to validate password only
 */
export function validatePassword(password: string): {
  success: boolean;
  error?: string;
} {
  const result = signInPasswordSchema.safeParse(password);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid password",
    };
  }
  return { success: true };
}

/**
 * Helper function to validate complete sign-in data
 */
export function validateUserSignIn(data: unknown): {
  success: boolean;
  data?: UserSignInInput;
  errors?: Record<string, string>;
} {
  const result = userSignInSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    });

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Helper function to validate admin sign-in data
 */
export function validateAdminSignIn(data: unknown): {
  success: boolean;
  data?: AdminSignInInput;
  errors?: Record<string, string>;
} {
  const result = adminSignInSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    });

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
