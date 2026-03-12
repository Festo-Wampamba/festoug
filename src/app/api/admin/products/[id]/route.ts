import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validations";

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

  // Validate input
  const result = productSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.issues },
      { status: 400 }
    );
  }

  const data = result.data;

  // Check slug uniqueness (excluding current product)
  const existing = await db.query.products.findFirst({
    where: and(eq(products.slug, data.slug), ne(products.id, id)),
  });
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists." },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(products)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      category: data.category,
      variantId: data.variantId || null,
      downloadUrl: data.downloadUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      isActive: data.isActive ?? true,
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
