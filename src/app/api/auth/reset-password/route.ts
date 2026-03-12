import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const [resetToken] = await withRetry((db) =>
      db.select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1)
    );

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
