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

    // Atomically delete the token and get the identifier back.
    // This prevents race conditions — only the first request succeeds.
    const deleted = await withRetry((db) =>
      db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.token, token),
            gt(verificationTokens.expires, new Date())
          )
        )
        .returning({ identifier: verificationTokens.identifier })
    );

    const tokenRow = deleted[0];
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
