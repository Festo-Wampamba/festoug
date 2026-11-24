import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { userId, title, message, type = "INFO", link } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 });
  }

  const [notif] = await db.insert(notifications).values({ userId, title, message, type, link }).returning();
  return NextResponse.json({ id: notif.id }, { status: 201 });
}
