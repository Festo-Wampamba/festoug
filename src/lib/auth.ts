import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth as betterAuth } from "@/lib/better-auth";

/**
 * Server-side session helper, shaped like the old NextAuth `auth()` so existing
 * route handlers and server components keep working unchanged:
 *   const session = await auth();
 *   if (!session?.user) ...
 *   session.user.id / role / accountStatus / email / name / image
 *
 * Backed by Better Auth under the hood.
 */
export async function auth() {
  const session = await betterAuth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const u = session.user as typeof session.user & {
    role?: "ADMIN" | "CUSTOMER";
    accountStatus?: "ACTIVE" | "SUSPENDED" | "BANNED";
  };

  return {
    user: {
      id: u.id,
      name: u.name ?? null,
      email: u.email,
      image: u.image ?? null,
      role: u.role ?? "CUSTOMER",
      accountStatus: u.accountStatus ?? "ACTIVE",
      emailVerified: !!u.emailVerified,
    },
  };
}

/**
 * Admin gate for API route handlers. Returns the session for an admin, or a
 * 403 response to return as-is:
 *   const session = await requireAdmin();
 *   if (session instanceof NextResponse) return session;
 * proxy.ts also gates /api/admin, but every handler checks again so a matcher
 * change can never expose admin writes.
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
