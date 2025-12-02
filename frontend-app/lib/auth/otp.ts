import bcrypt from 'bcrypt';
import { prisma } from '@/app/lib/db/prisma';

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate random 6-digit number (100000-999999)
  const min = 100000;
  const max = 999999;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
}

/**
 * Hash OTP code using bcrypt
 */
export async function hashOTP(code: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(code, saltRounds);
}

/**
 * Verify OTP code against hashed version
 */
export async function verifyOTP(code: string, hashedCode: string): Promise<boolean> {
  return await bcrypt.compare(code, hashedCode);
}

/**
 * Store OTP in database with expiration
 */
export async function storeOTP(email: string, code: string): Promise<void> {
  const hashedCode = await hashOTP(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Delete any existing unverified OTPs for this email
  await prisma.oTP.deleteMany({
    where: {
      email,
      verified: false,
    },
  });

  // Create new OTP
  await prisma.oTP.create({
    data: {
      email,
      code: hashedCode,
      expiresAt,
      verified: false,
    },
  });
}

/**
 * Verify OTP from database
 */
export async function verifyOTPFromDB(email: string, code: string): Promise<boolean> {
  // Find the most recent unverified OTP for this email
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      verified: false,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Verify the code
  const isValid = await verifyOTP(code, otpRecord.code);

  if (isValid) {
    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
  }

  return isValid;
}

/**
 * Clean up expired OTPs (can be run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Check if user has exceeded OTP request rate limit
 * Returns true if rate limit exceeded
 */
export async function checkOTPRateLimit(email: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Count OTPs created in the last 10 minutes
  const count = await prisma.oTP.count({
    where: {
      email,
      createdAt: {
        gte: tenMinutesAgo,
      },
    },
  });

  // Allow max 3 OTP requests per 10 minutes
  return count >= 3;
}
