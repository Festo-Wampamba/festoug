import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, title, message, type = "INFO", link } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 });
  }

  const [notif] = await db.insert(notifications).values({ userId, title, message, type, link }).returning();
  return NextResponse.json({ id: notif.id }, { status: 201 });
}
