import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateCheckoutLink } from "@/lib/payments/lemonsqueezy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // 1. Fetch Product
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Optional: Protect the checkout so only logged in users can buy?
    // The instructions implied user accounts are needed, so let's enforce it
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=/store/${product.slug}`, req.url));
    }

    // 2. Fetch the Lemon Squeezy Variant ID associated with this product
    const variantId = product.variantId;

    if (!variantId) {
      return NextResponse.json(
        { error: "Product is missing a Lemon Squeezy Variant ID connection. Setup incomplete." },
        { status: 500 }
      );
    }

    // 3. Generate Checkout Link
    const checkoutUrl = await generateCheckoutLink(
      variantId,
      process.env.LEMONSQUEEZY_STORE_ID!,
      {
        user_id: session.user.id,
        product_slug: product.slug,
      }
    );

    // 4. Redirect User to the hosted checkout
    return NextResponse.redirect(checkoutUrl);
  } catch (error: any) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
