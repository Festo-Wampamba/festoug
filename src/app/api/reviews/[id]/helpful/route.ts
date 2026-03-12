import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, reviewHelpfulVotes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, id),
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot vote on your own review" },
      { status: 400 }
    );
  }

  const existingVote = await db.query.reviewHelpfulVotes.findFirst({
    where: and(
      eq(reviewHelpfulVotes.reviewId, id),
      eq(reviewHelpfulVotes.userId, session.user.id)
    ),
  });

  if (existingVote) {
    await db.transaction(async (tx) => {
      await tx
        .delete(reviewHelpfulVotes)
        .where(eq(reviewHelpfulVotes.id, existingVote.id));
      await tx
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} - 1` })
        .where(eq(reviews.id, id));
    });
    return NextResponse.json({ voted: false });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(reviewHelpfulVotes).values({
        reviewId: id,
        userId: session.user.id,
      });
      await tx
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
        .where(eq(reviews.id, id));
    });
    return NextResponse.json({ voted: true });
  }
}
