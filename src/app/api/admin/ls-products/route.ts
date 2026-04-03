import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { lemonSqueezySetup, listProducts, listVariants } from "@lemonsqueezy/lemonsqueezy.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    return NextResponse.json({ error: "Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID" }, { status: 500 });
  }

  lemonSqueezySetup({ apiKey });

  const [lsProductsRes, lsVariantsRes, dbProducts] = await Promise.all([
    listProducts({ filter: { storeId: Number(storeId) } }),
    listVariants(),
    db.select({ variantId: products.variantId, slug: products.slug, name: products.name, id: products.id }).from(products),
  ]);

  if (lsProductsRes.error || lsVariantsRes.error) {
    return NextResponse.json(
      { error: lsProductsRes.error?.message || lsVariantsRes.error?.message || "LS API error" },
      { status: 502 }
    );
  }

  const importedVariantIds = new Set(dbProducts.map((p) => p.variantId).filter(Boolean));

  const lsProducts = (lsProductsRes.data?.data || []).map((p) => ({
    id: p.id,
    name: p.attributes.name,
    status: p.attributes.status,
  }));

  const lsVariants = (lsVariantsRes.data?.data || []).map((v) => {
    const productRel = v.relationships?.product?.data as { id: string } | { id: string }[] | undefined;
    const productId = Array.isArray(productRel) ? (productRel[0]?.id ?? "") : (productRel?.id ?? "");
    return {
      id: v.id,
      name: v.attributes.name,
      price: (v.attributes.price / 100).toFixed(2),
      status: v.attributes.status,
      productId,
      alreadyImported: importedVariantIds.has(v.id),
      dbProduct: dbProducts.find((p) => p.variantId === v.id) ?? null,
    };
  });

  return NextResponse.json({ lsProducts, lsVariants });
}
