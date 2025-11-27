import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// Validation schema for updating tag
const UpdateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
});

// PUT /api/admin/tags/[id] - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateTagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Find tag
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if another tag with the same name already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      );
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(
      {
        message: 'Tag updated successfully',
        tag: updatedTag,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tag:', error);

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

// DELETE /api/admin/tags/[id] - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    // Find tag
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if tag is being used by any documents
    const documentsUsingTag = await prisma.document.count({
      where: {
        tags: {
          has: tag.name,
        },
      },
    });

    if (documentsUsingTag > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tag. It is being used by ${documentsUsingTag} document(s)`,
        },
        { status: 400 }
      );
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tag deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tag:', error);

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
