import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/db/prisma';
import { UserRole, UserStatus } from '@prisma/client';

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type SessionData = {
  user: SessionUser;
  expiresAt: Date;
};

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'employai.session';
const SESSION_EXPIRY_DAYS = 7;

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Find session in database
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
      },
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // Delete from database
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Update user role in session (for admin verification)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

/**
 * Clean up expired sessions (can be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Require session (throws if not authenticated)
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require admin session (throws if not admin)
 */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await requireSession();

  if (session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Check if user is active (not on standby)
 */
export async function requireActiveUser(): Promise<SessionData> {
  const session = await requireSession();

  if (session.user.status === 'STANDBY') {
    throw new Error('Account temporarily suspended');
  }

  return session;
}
