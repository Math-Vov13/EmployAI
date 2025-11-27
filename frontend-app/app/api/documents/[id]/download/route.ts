import { NextRequest, NextResponse } from 'next/server';
import { requireActiveUser } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';
import { generatePresignedUrl } from '@/app/lib/storage/s3-client';

// GET /api/documents/[id]/download - Generate presigned download URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireActiveUser();
    const { id } = await params;

    // Find document
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only allow downloading online documents
    if (document.status !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Document not available for download' },
        { status: 403 }
      );
    }

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(document.fileKey);

    if (!presignedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        downloadUrl: presignedUrl,
        fileName: document.fileName,
        expiresIn: 3600, // 1 hour in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating download URL:', error);

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
