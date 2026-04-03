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

    // Neon HTTP driver does not support transactions — run sequential queries instead
    await db.update(users).set({ accountStatus: action }).where(eq(users.id, id));

    if (action === "BANNED") {
      try {
        await db.insert(bannedEmails).values({
          email: targetUser.email.toLowerCase(),
          reason: reason || "Terms of service violation",
          bannedBy: session.user.id,
        });
      } catch (e: any) {
        // Ignore unique-constraint violation (email already in banned list)
        if (!e.message?.includes("unique")) throw e;
      }
    }

    if (action === "ACTIVE") {
      await db.delete(bannedEmails).where(eq(bannedEmails.email, targetUser.email.toLowerCase()));
    }

    return NextResponse.json({ success: true, status: action });
  } catch (error) {
    console.error("[CUSTOMER_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const [targetUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CUSTOMER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
