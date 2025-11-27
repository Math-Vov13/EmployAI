import { NextResponse } from 'next/server';
import { deleteSession } from '@/app/lib/auth/session';

export async function POST() {
  try {
    // Delete session
    await deleteSession();

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
