import { headers } from "next/headers";
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
