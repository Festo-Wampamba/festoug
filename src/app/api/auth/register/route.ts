import { db } from "@/lib/db";
import { users, bannedEmails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 registration attempts per IP per 15 minutes
    const ip = getClientIp(req);
    const limiter = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Check if email is permanently banned
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

    // Check if user already exists
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
