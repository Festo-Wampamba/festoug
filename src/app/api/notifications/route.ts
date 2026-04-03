import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET — fetch current user's notifications
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(items);
}

// PATCH — mark all as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.read, false)));

  return NextResponse.json({ ok: true });
}
