import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, storeOTP, checkOTPRateLimit } from '@/app/lib/auth/otp';
import { sendOTPEmail } from '@/app/lib/email/resend-client';

// Validation schema
const SendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = SendOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check rate limit
    const rateLimitExceeded = await checkOTPRateLimit(email);
    if (rateLimitExceeded) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 10 minutes.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const code = generateOTP();

    // Store OTP in database
    await storeOTP(email, code);

    // Send OTP via email
    const result = await sendOTPEmail(email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Verification code sent successfully',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
