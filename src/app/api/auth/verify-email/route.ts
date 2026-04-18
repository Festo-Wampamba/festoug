import { NextRequest, NextResponse } from "next/server";
import { withRetry } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find a non-expired token
    const [tokenRow] = await withRetry((db) =>
      db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.token, token),
            gt(verificationTokens.expires, new Date())
          )
        )
        .limit(1)
    );

    if (!tokenRow) {
      return NextResponse.json(
        { error: "This link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified
    await withRetry((db) =>
      db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, tokenRow.identifier))
    );

    // Delete the used token
    await withRetry((db) =>
      db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, tokenRow.identifier),
            eq(verificationTokens.token, token)
          )
        )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
