import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session.user,
        expiresAt: session.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
