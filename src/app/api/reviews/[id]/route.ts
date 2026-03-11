import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { reviewUpdateSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = reviewUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), eq(reviews.userId, session.user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { rating, title, body: reviewBody } = result.data;

  const status = existing.status === "REJECTED"
    ? "PENDING"
    : rating >= 3 ? "APPROVED" : "PENDING";

  const [updated] = await db
    .update(reviews)
    .set({ rating, title, body: reviewBody, status, updatedAt: new Date() })
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), eq(reviews.userId, session.user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await db
    .delete(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
