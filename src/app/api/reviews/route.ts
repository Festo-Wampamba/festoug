import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/db/schema";
import { reviewSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = reviewSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { productId, orderId, rating, title, body: reviewBody } = result.data;

  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      eq(orders.userId, session.user.id),
      eq(orders.productId, productId),
      eq(orders.status, "COMPLETED")
    ),
  });

  if (!order) {
    return NextResponse.json(
      { error: "You can only review products you have purchased" },
      { status: 403 }
    );
  }

  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.userId, session.user.id),
      eq(reviews.productId, productId)
    ),
  });

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already reviewed this product. You can edit your existing review." },
      { status: 409 }
    );
  }

  const status = rating >= 3 ? "APPROVED" : "PENDING";

  const [review] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      productId,
      orderId,
      rating,
      title,
      body: reviewBody,
      status,
    })
    .returning();

  return NextResponse.json(review, { status: 201 });
}
