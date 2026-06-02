import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { dash } from "@better-auth/infra";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "@/lib/db/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

/**
 * Better Auth needs a concrete drizzle instance (not the lazy Proxy from
 * lib/db). Build one here, picking the Neon HTTP driver on Vercel and
 * postgres.js for local/Docker — mirrors lib/db/index.ts.
 */
function createAuthDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // No DB at build time — return a placeholder; auth is only used at runtime.
    return null as unknown as ReturnType<typeof drizzlePg>;
  }
  const isNeon = url.includes("neon.tech") || url.includes("neon.cloud");
  if (isNeon) {
    const httpUrl = url
      .replace("-pooler", "")
      .replace(/[?&]channel_binding=[^&]*/g, "")
      .replace(/\?$/, "");
    return drizzleNeon(neon(httpUrl), { schema });
  }
  return drizzlePg(postgres(url, { max: 5 }), { schema });
}

const db = createAuthDb();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // unverified email/password users cannot sign in
    minPasswordLength: 8,
    // Keep bcrypt (cost 12) so the existing admin hash + new signups stay consistent.
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
    resetPasswordTokenExpiresIn: 60 * 5, // 5 minutes
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 5, // 5 minutes
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false, // clients cannot set their own role
      },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(), // uuid ids to fit the existing columns
    },
  },
  plugins: [dash(), nextCookies()], // nextCookies must be last
});
