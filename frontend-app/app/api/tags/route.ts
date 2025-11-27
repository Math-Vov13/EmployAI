import { NextResponse } from 'next/server';
import { requireActiveUser } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// GET /api/tags - List all tags
export async function GET() {
  try {
    await requireActiveUser();

    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tags:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
      }
      if (error.message === 'Account temporarily suspended') {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
