import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { variantId, name, price, category } = body as {
    variantId: string;
    name: string;
    price: string;
    category: string;
  };

  if (!variantId || !name || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if already imported
  const existing = await db.query.products.findFirst({
    where: eq(products.variantId, variantId),
  });
  if (existing) {
    return NextResponse.json({ error: "This variant is already imported", product: existing }, { status: 409 });
  }

  // Slugify the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check slug uniqueness, append variant suffix if needed
  const existingSlug = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  const finalSlug = existingSlug ? `${slug}-${variantId}` : slug;

  const [product] = await db.insert(products).values({
    name,
    slug: finalSlug,
    description: `Imported from Lemon Squeezy (variant ${variantId})`,
    price,
    currency: "USD",
    category: category as any || "OTHER",
    variantId,
    isActive: true,
  }).returning();

  return NextResponse.json({ product }, { status: 201 });
}
