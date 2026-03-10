import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// CREATE a new product
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const [newProduct] = await db
    .insert(products)
    .values({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: body.price,
      category: body.category,
      variantId: body.variantId || null,
      downloadUrl: body.downloadUrl || null,
      thumbnailUrl: body.thumbnailUrl || null,
      isActive: body.isActive ?? true,
    })
    .returning();

  return NextResponse.json(newProduct, { status: 201 });
}
