import { cookies } from "next/headers";
import db from "@/lib/db/prisma";
import { hashPassword, verifyPassword, signToken, verifyToken } from "./crypto";

const SESSION_COOKIE_NAME = "resumeforge_session";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionTier: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const token = signToken({ userId });
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const passwordHash = hashPassword(password);
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || "User",
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
      },
    });

    await createSession(user.id);
    return { success: true, user };
  } catch (err: unknown) {
    console.error("Sign up error:", err);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    await createSession(user.id);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
    };
  } catch (err: unknown) {
    console.error("Sign in error:", err);
    return { success: false, error: "Failed to sign in. Please try again." };
  }
}
