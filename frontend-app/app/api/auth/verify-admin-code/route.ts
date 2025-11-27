import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, updateUserRole } from '@/app/lib/auth/session';

// Validation schema
const VerifyAdminCodeSchema = z.object({
  code: z.string().min(1, 'Admin code is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Require authenticated session
    const session = await requireSession();

    // Parse and validate request body
    const body = await request.json();
    const validation = VerifyAdminCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Verify admin secret code
    const adminSecretCode = process.env.ADMIN_SECRET_CODE;

    if (!adminSecretCode) {
      console.error('ADMIN_SECRET_CODE is not configured');
      return NextResponse.json(
        { error: 'Admin verification not configured' },
        { status: 500 }
      );
    }

    if (code !== adminSecretCode) {
      return NextResponse.json(
        { error: 'Invalid admin code' },
        { status: 401 }
      );
    }

    // Update user role to ADMIN
    await updateUserRole(session.user.id, 'ADMIN');

    return NextResponse.json(
      {
        message: 'Admin verification successful',
        user: {
          ...session.user,
          role: 'ADMIN',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-admin-code:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please sign in first' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
