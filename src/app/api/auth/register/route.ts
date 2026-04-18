import { db } from "@/lib/db";
import { users, bannedEmails, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const [banned] = await db
      .select({ id: bannedEmails.id })
      .from(bannedEmails)
      .where(eq(bannedEmails.email, email.toLowerCase()))
      .limit(1);

    if (banned) {
      return NextResponse.json(
        { error: "This email address has been permanently banned. Contact support if you believe this is an error." },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
    });

    // Generate and store email verification token (24h expiry)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    // Fire-and-forget — don't fail registration if email send fails
    sendVerificationEmail(email, token).catch((err) =>
      console.error("[REGISTER] Verification email failed:", err)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
