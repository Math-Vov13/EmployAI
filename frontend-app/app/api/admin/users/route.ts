import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';

// GET /api/admin/users - List all users
export async function GET() {
  try {
    await requireAdminSession();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get counts by status
    const statusCounts = {
      ONLINE: users.filter((u) => u.status === 'ONLINE').length,
      OFFLINE: users.filter((u) => u.status === 'OFFLINE').length,
      STANDBY: users.filter((u) => u.status === 'STANDBY').length,
      total: users.length,
    };

    return NextResponse.json(
      {
        users,
        counts: statusCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);

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

// Validation schema for creating user
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
  status: z.enum(['ONLINE', 'OFFLINE', 'STANDBY']).optional().default('ONLINE'),
});

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, role, status } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        role,
        status,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);

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
