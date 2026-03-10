import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// UPDATE a product
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(products)
    .set({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: body.price,
      category: body.category,
      variantId: body.variantId || null,
      downloadUrl: body.downloadUrl || null,
      thumbnailUrl: body.thumbnailUrl || null,
      isActive: body.isActive ?? true,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE a product
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
