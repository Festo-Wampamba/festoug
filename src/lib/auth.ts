import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { DefaultSession, NextAuthConfig } from "next-auth";

// Extend the built-in session types to carry the user role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      accountStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
    } & DefaultSession["user"];
  }
}

/**
 * Create a direct drizzle instance for use by the Auth.js adapter.
 * This is separate from the lazy Proxy in lib/db/index.ts because
 * DrizzleAdapter requires the real drizzle instance (not a Proxy).
 * Returns undefined when DATABASE_URL is absent (e.g., during build).
 */
function isNeonUrl(url: string) {
  return url.includes("neon.tech") || url.includes("neon.cloud");
}

function createAuthDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  if (isNeonUrl(url)) {
    // Neon HTTP driver — required for Vercel serverless (no raw TCP)
    // Strip -pooler and channel_binding (TCP param not supported by HTTP driver)
    const httpUrl = url
      .replace("-pooler", "")
      .replace(/[?&]channel_binding=[^&]*/g, "")
      .replace(/\?$/, "");
    const sql = neon(httpUrl);
    return drizzle(sql, { schema }) as any;
  } else {
    // Local / Docker PostgreSQL via postgres.js
    const sql = postgres(url, { max: 5 });
    return drizzlePg(sql, { schema });
  }
}

const authDb = createAuthDb();

export const authConfig: NextAuthConfig = {
  // Only pass adapter when DATABASE_URL is set
  ...(authDb ? { adapter: DrizzleAdapter(authDb) } : {}),
  session: {
    strategy: "jwt", // Stateless JWT — works with Vercel Edge runtime
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  providers: [
    // ── OAuth Providers ──────────────────────────────────────────────────────
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Email / Password (Credentials) ───────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !authDb) return null;

        const [user] = await authDb
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        // Block permanently banned users from signing in
        if (user.accountStatus === "BANNED") {
          throw new Error("ACCOUNT_BANNED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          accountStatus: user.accountStatus,
        };
      },
    }),
  ],

  callbacks: {
    // Allow OAuth sign-in even when adapter has issues
    async signIn({ account }) {
      // Always allow credentials (handled by authorize())
      if (account?.provider === "credentials") return true;
      // Allow all OAuth providers
      return true;
    },

    // Attach role + accountStatus to the JWT on sign-in,
    // and refresh from DB on every request (with short TTL) so that
    // bans / role changes take effect without requiring sign-out.
    async jwt({ token, user }) {
      // ── Initial sign-in: seed the token from the user object ───────────
      if (user) {
        token.id = user.id;
        // @ts-expect-error role is a custom field
        let role = user.role;
        // @ts-expect-error accountStatus is a custom field
        let accountStatus = user.accountStatus;

        // For OAuth sign-ins the adapter user object may not carry
        // custom columns (role, accountStatus). Fetch them from the DB.
        if (!role && authDb && user.id) {
          const [dbUser] = await authDb
            .select({ role: users.role, accountStatus: users.accountStatus })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);
          if (dbUser) {
            role = dbUser.role;
            accountStatus = dbUser.accountStatus;
          }
        }

        token.role = role ?? "CUSTOMER";
        token.accountStatus = accountStatus ?? "ACTIVE";
        token.statusCheckedAt = Date.now();
        return token;
      }

      // ── Subsequent requests: refresh role + status from DB ──────────────
      // Prevents stale-JWT bypass where a banned/demoted user keeps using a
      // pre-ban token until expiry. Uses a 30s TTL to bound DB load.
      const REFRESH_INTERVAL_MS = 30 * 1000;
      const lastChecked = (token.statusCheckedAt as number | undefined) ?? 0;
      const isStale = Date.now() - lastChecked > REFRESH_INTERVAL_MS;

      if (isStale && authDb && token.id) {
        const [dbUser] = await authDb
          .select({ role: users.role, accountStatus: users.accountStatus })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);

        // User deleted → invalidate the token entirely
        if (!dbUser) return null;

        token.role = dbUser.role;
        token.accountStatus = dbUser.accountStatus;
        token.statusCheckedAt = Date.now();
      }

      return token;
    },

    // Expose role, id, and accountStatus on the session object for client use
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "CUSTOMER") ?? "CUSTOMER";
        session.user.accountStatus = (token.accountStatus as "ACTIVE" | "SUSPENDED" | "BANNED") ?? "ACTIVE";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
