import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// Validation schema
const UpdateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'PENDING', 'DELETED']),
});

// PATCH /api/admin/documents/[id]/status - Update document status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Find document
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update status
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: { status },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Document status updated successfully',
        document: updatedDocument,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating document status:', error);

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
