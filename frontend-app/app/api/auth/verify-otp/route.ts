import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyOTPFromDB } from '@/app/lib/auth/otp';
import { createSession, setSessionCookie } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';
import { sendWelcomeEmail } from '@/app/lib/email/resend-client';

// Validation schema
const VerifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = VerifyOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, code } = validation.data;

    // Verify OTP
    const isValid = await verifyOTPFromDB(email, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          role: 'USER',
          status: 'ONLINE',
        },
      });

      // Send welcome email (don't wait for it)
      sendWelcomeEmail(email).catch((error) => {
        console.error('Failed to send welcome email:', error);
      });
    } else {
      // Update existing user status to ONLINE
      user = await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ONLINE' },
      });
    }

    // Check if user is on standby
    if (user.status === 'STANDBY') {
      return NextResponse.json(
        { error: 'Your account is temporarily suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Create session
    const token = await createSession(user.id);

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        isNewUser,
        // Indicate if user needs admin verification
        requiresAdminVerification: user.role !== 'ADMIN',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
