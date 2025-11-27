import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// GET /api/admin/documents - List all documents with filters
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query
    const where: any = {};

    // Filter by status if provided
    if (status && ['ONLINE', 'PENDING', 'DELETED'].includes(status)) {
      where.status = status;
    }

    // Get all documents
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

    // Get counts by status
    const counts = await prisma.document.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = {
      ONLINE: counts.find((c) => c.status === 'ONLINE')?._count || 0,
      PENDING: counts.find((c) => c.status === 'PENDING')?._count || 0,
      DELETED: counts.find((c) => c.status === 'DELETED')?._count || 0,
      total: documents.length,
    };

    return NextResponse.json(
      {
        documents,
        counts: statusCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin documents:', error);

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
