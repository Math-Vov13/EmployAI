import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET n est pas definie en env");
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isLoggedIn: boolean;
  googleId?: string; // oAuth
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();

  return getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: "employai_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 60,
      path: "/",
    },
  });
}

export async function createSession(
  userId: string,
  email: string,
  name: string,
  role: "USER" | "ADMIN",
  googleId?: string,
  rememberMe: boolean = false,
) {
  const cookieStore = await cookies();

  // Calculate maxAge based on rememberMe
  // rememberMe = true: 7 days (604800 seconds)
  // rememberMe = false: session cookie (expires when browser closes)
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : undefined;

  const session = await getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: "employai_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: maxAge,
      path: "/",
    },
  });

  session.userId = userId;
  session.email = email;
  session.name = name;
  session.role = role;
  session.isLoggedIn = true;
  if (googleId) {
    session.googleId = googleId;
  }
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return null;
  }

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    googleId: session.googleId,
  };
}
