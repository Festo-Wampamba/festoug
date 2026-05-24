import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations";

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`reset-password:${ip}`, { limit: 10, windowSeconds: 900 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    // The form submits `confirm` separately; if absent, default it to password
    // so server-side validation matches what the client enforced.
    const parsed = resetPasswordSchema.safeParse({
      token: body?.token,
      password: body?.password,
      confirm: body?.confirm ?? body?.password,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    // Tokens are stored hashed; hash the incoming token before lookup.
    const tokenHash = hashToken(token);

    // Atomically consume the token to prevent double-use / race conditions.
    const consumed = await withRetry((db) =>
      db
        .delete(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, tokenHash),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .returning({ userId: passwordResetTokens.userId })
    );

    const resetToken = consumed[0];
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await withRetry((db) =>
      db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, resetToken.userId))
    );

    // Belt-and-braces: drop any other outstanding tokens for this user
    await withRetry((db) =>
      db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, resetToken.userId))
    );

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
