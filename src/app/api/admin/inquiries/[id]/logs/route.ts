import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiryPaymentLogs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET — fetch all payment logs for an inquiry
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const logs = await db
    .select()
    .from(inquiryPaymentLogs)
    .where(eq(inquiryPaymentLogs.inquiryId, id))
    .orderBy(asc(inquiryPaymentLogs.createdAt));

  return NextResponse.json(logs);
}

// POST — add a new payment log entry
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { eventType, amount, note } = await req.json();

  if (!eventType || !note) {
    return NextResponse.json({ error: "eventType and note are required" }, { status: 400 });
  }

  const [log] = await db
    .insert(inquiryPaymentLogs)
    .values({ inquiryId: id, eventType, amount: amount ?? null, note })
    .returning();

  return NextResponse.json(log, { status: 201 });
}
