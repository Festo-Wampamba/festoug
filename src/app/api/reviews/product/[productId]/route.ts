import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const productReviews = await db.query.reviews.findMany({
    where: and(
      eq(reviews.productId, productId),
      eq(reviews.status, "APPROVED")
    ),
    with: {
      user: { columns: { id: true, name: true, image: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return NextResponse.json(productReviews);
}
