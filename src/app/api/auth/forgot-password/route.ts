import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const successResponse = NextResponse.json({
      message: "If an account exists with that email, a reset link has been sent.",
    });

    const [user] = await withRetry((db) =>
      db.select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1)
    );

    if (!user || !user.passwordHash) {
      return successResponse;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await withRetry((db) =>
      db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      })
    );

    await sendPasswordResetEmail(email, token);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
