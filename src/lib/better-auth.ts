import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "@/lib/db/schema";
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordResetOTP } from "@/lib/email";

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
      // Embed email in the reset URL so the reset page can auto sign-in after reset
      const resetUrl = new URL(url);
      resetUrl.searchParams.set("email", user.email);
      await sendPasswordResetEmail(user.email, resetUrl.toString());
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
  trustedOrigins: [
    "https://festoug.com",
    "https://www.festoug.com",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "forget-password") {
          await sendPasswordResetOTP(email, otp);
        }
      },
      expiresIn: 60 * 5, // 5 minutes
    }),
    nextCookies(), // nextCookies must be last
  ],
});
