import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const validStatuses = ["APPROVED", "PENDING", "REJECTED"];
  const statusFilter = status && validStatuses.includes(status) ? status as "APPROVED" | "PENDING" | "REJECTED" : undefined;

  const allReviews = await db.query.reviews.findMany({
    where: statusFilter ? eq(reviews.status, statusFilter) : undefined,
    with: {
      user: { columns: { id: true, name: true, email: true, image: true } },
      product: { columns: { id: true, name: true, slug: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return NextResponse.json(allReviews);
}
