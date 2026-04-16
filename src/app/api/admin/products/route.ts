import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validations";

// CREATE a new product
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // Check slug uniqueness
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, data.slug),
  });
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists." },
      { status: 409 }
    );
  }

  const [newProduct] = await db
    .insert(products)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      category: data.category,
      variantId: data.variantId || null,
      downloadUrl: data.downloadUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      screenshots: data.screenshots ?? [],
      isActive: data.isActive ?? true,
    })
    .returning();

  return NextResponse.json(newProduct, { status: 201 });
}
