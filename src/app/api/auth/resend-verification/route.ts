import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 1 resend per 5 minutes per user
    const limiter = rateLimit(`resend-verification:${session.user.id}`, {
      limit: 1,
      windowSeconds: 300,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Please wait a few minutes before requesting another verification email." },
        { status: 429 }
      );
    }

    // Fetch current emailVerified status
    const [user] = await withRetry((db) =>
      db
        .select({ email: users.email, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Delete any existing tokens for this email
    await withRetry((db) =>
      db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, user.email))
    );

    // Create a new token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await withRetry((db) =>
      db.insert(verificationTokens).values({
        identifier: user.email,
        token,
        expires,
      })
    );

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
