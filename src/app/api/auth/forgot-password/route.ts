import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

// Reset tokens are short-lived to limit the attack window.
const RESET_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`forgot-password:ip:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase().trim();

    // Per-email rate limit (prevents targeted enumeration / harassment)
    const emailLimit = rateLimit(`forgot-password:email:${email}`, { limit: 3, windowSeconds: 900 });

    // Generic response — never leak whether the email exists
    const successResponse = NextResponse.json({
      message: "If an account exists with that email, a reset link has been sent.",
    });

    if (!emailLimit.success) {
      return successResponse;
    }

    const [user] = await withRetry((db) =>
      db.select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    );

    if (!user || !user.passwordHash) {
      return successResponse;
    }

    // Invalidate any prior reset tokens for this user
    await withRetry((db) =>
      db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))
    );

    // Generate a random token; store only the hash in the DB (defense in depth
    // — DB compromise alone cannot grant reset access).
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await withRetry((db) =>
      db.insert(passwordResetTokens).values({
        userId: user.id,
        token: tokenHash,
        expiresAt,
      })
    );

    await sendPasswordResetEmail(email, rawToken);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
