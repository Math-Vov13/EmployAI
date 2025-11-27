import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveUser } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';
import { uploadFileToS3, generateFileKey, validateS3Config } from '@/app/lib/storage/s3-client';
import { validateFile } from '@/app/lib/storage/file-validation';

// GET /api/documents - List documents
export async function GET(request: NextRequest) {
  try {
    const session = await requireActiveUser();
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');

    // Build query
    const where: any = {
      status: 'ONLINE', // Only show online documents
    };

    // Filter by tag if provided
    if (tag) {
      where.tags = { has: tag };
    }

    // Get documents
    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);

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

// Validation schema for document upload
const UploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags'),
});

// POST /api/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    const session = await requireActiveUser();

    // Validate S3 configuration
    const s3ConfigValidation = validateS3Config();
    if (!s3ConfigValidation.valid) {
      return NextResponse.json(
        { error: s3ConfigValidation.error || 'Storage not configured' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tagsString = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse tags
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsString);
    } catch {
      return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
    }

    // Validate metadata
    const metadataValidation = UploadDocumentSchema.safeParse({ title, description, tags });
    if (!metadataValidation.success) {
      return NextResponse.json(
        { error: metadataValidation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Validate file
    const fileValidation = validateFile(file.name, file.type, file.size);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.errors[0] || 'Invalid file' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate file key
    const fileKey = generateFileKey(session.user.id, file.name);

    // Upload to S3
    const uploadResult = await uploadFileToS3(fileKey, fileBuffer, file.type);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileUrl: uploadResult.fileUrl,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING', // Default status for user uploads
        uploadedById: session.user.id,
        tags,
      },
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
        message: 'Document uploaded successfully',
        document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);

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
