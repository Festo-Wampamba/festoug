import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by both userId and IP for defense-in-depth
    const ip = getClientIp(req);
    const limiter = rateLimit(`resend-verification:${session.user.id}:${ip}`, {
      limit: 1,
      windowSeconds: 300,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Please wait a few minutes before requesting another verification email." },
        { status: 429 }
      );
    }

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

    // Delete any existing tokens for this email, then insert a fresh one
    await withRetry((db) =>
      db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, user.email))
    );

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
