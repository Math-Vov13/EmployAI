import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// Validation schema for creating tag
const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
});

// POST /api/admin/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateTagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      );
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: { name },
    });

    return NextResponse.json(
      {
        message: 'Tag created successfully',
        tag,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
      }
      if (error.message.includes('Admin')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
