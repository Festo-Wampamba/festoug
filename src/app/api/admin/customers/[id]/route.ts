import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, bannedEmails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the target user first
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow banning admins
    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 403 });
    }

    // Use a transaction so status update + banned email list stay in sync
    await db.transaction(async (tx) => {
      // Update the user's account status
      await tx
        .update(users)
        .set({ accountStatus: action })
        .where(eq(users.id, id));

      // If permanently banning, also add their email to the banned list
      if (action === "BANNED") {
        try {
          await tx.insert(bannedEmails).values({
            email: targetUser.email.toLowerCase(),
            reason: reason || "Terms of service violation",
            bannedBy: session.user.id,
          });
        } catch (e: any) {
          // Email might already be in banned list (unique constraint)
          if (!e.message?.includes("unique")) throw e;
        }
      }

      // If restoring, remove from banned emails list
      if (action === "ACTIVE") {
        await tx.delete(bannedEmails).where(eq(bannedEmails.email, targetUser.email.toLowerCase()));
      }
    });

    return NextResponse.json({ success: true, status: action });
  } catch (error) {
    console.error("[CUSTOMER_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
