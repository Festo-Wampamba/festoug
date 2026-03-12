import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/lemonsqueezy";
import { db } from "@/lib/db";
import { orders, licenses, products, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    
    // We only care about order creation (or subscription payments)
    if (eventName === "order_created") {
      const orderData = payload.data.attributes;
      
      const externalOrderId = payload.data.id.toString();
      const amount = (orderData.total / 100).toFixed(2); // LS sends amounts in cents
      const currency = orderData.currency.toUpperCase();
      
      // Look up user if passed in custom data
      let userId = null;
      if (customData.user_id) {
        // Optional verification if the user exists
        const user = await db.query.users.findFirst({
          where: eq(users.id, customData.user_id)
        });
        if (user) userId = user.id;
      }

      // We need a dummy or actual product id. 
      // Often you might map LS variant IDs to internal DB product IDs, 
      // but for now we look up by some identifier in customData.
      const productSlug = customData.product_slug || "custom-service-retainer";
      let product = await db.query.products.findFirst({
        where: eq(products.slug, productSlug)
      });

      // Return an error so Lemon Squeezy retries the webhook
      if (!product) {
        console.error(`[WEBHOOK] Product slug '${productSlug}' not found. Order ID: ${externalOrderId}`);
        return NextResponse.json(
          { error: `Product slug '${productSlug}' not found. Order could not be created.` },
          { status: 422 }
        );
      }

      // Insert Order
      const [newOrder] = await db.insert(orders).values({
        userId,
        productId: product.id,
        gateway: "LEMONSQUEEZY",
        externalOrderId,
        status: "COMPLETED",
        amount,
        currency,
      }).returning();

      // If it's a digital scalable product (Script/Template), issue a License
      if (product.category === "SCRIPT" || product.category === "TEMPLATE" || product.category === "PLUGIN") {
        const licenseKey = crypto.randomBytes(16).toString("hex").toUpperCase();
        
        if (userId) {
          await db.insert(licenses).values({
            orderId: newOrder.id,
            userId,
            productId: product.id,
            licenseKey,
            isActive: true,
          });
        }
      }
    }

    return NextResponse.json({ message: "Webhook processed gracefully." }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
