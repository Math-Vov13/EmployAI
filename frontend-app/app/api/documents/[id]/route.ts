import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveUser } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';
import { deleteFileFromS3 } from '@/app/lib/storage/s3-client';

// GET /api/documents/[id] - Get document details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireActiveUser();
    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
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

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only allow access to online documents
    if (document.status !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Document not available' },
        { status: 403 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error fetching document:', error);

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

// Validation schema for document update
const UpdateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags').optional(),
});

// PUT /api/documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireActiveUser();
    const { id } = await params;

    // Find document
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check ownership
    if (document.uploadedById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own documents' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: validation.data,
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
        message: 'Document updated successfully',
        document: updatedDocument,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating document:', error);

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

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireActiveUser();
    const { id } = await params;

    // Find document
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check ownership
    if (document.uploadedById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own documents' },
        { status: 403 }
      );
    }

    // Delete from S3
    const deleted = await deleteFileFromS3(document.fileKey);

    if (!deleted) {
      console.error('Failed to delete file from S3, but continuing with database deletion');
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);

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
