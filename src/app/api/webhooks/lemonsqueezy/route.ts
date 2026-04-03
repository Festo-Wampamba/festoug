import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/lemonsqueezy";
import { db } from "@/lib/db";
import { orders, licenses, products, users, subscriptions, maintenanceTrials } from "@/lib/db/schema";
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

      const productSlug = customData.product_slug as string | undefined;

      if (!productSlug) {
        // Order came from outside the site checkout (e.g. direct LS link) — no product slug attached.
        // Log it for manual reconciliation and acknowledge so LS doesn't retry endlessly.
        console.warn(`[WEBHOOK] order_created (ID: ${externalOrderId}) has no product_slug in custom_data. Skipping order record. Custom data:`, JSON.stringify(customData));
        return NextResponse.json({ message: "Order acknowledged (no product_slug — skipped)" }, { status: 200 });
      }

      let product = await db.query.products.findFirst({
        where: eq(products.slug, productSlug)
      });

      if (!product) {
        // Product slug sent but not found in DB. Log and acknowledge — returning 500 would
        // cause LS to retry indefinitely; 200 lets us handle it via manual reconciliation.
        console.error(`[WEBHOOK] order_created: product slug '${productSlug}' not found in DB. Order ID: ${externalOrderId}. Add the product via /admin/products/new or /admin/ls-sync, then replay this order.`);
        return NextResponse.json({ message: "Order acknowledged (product not in DB — skipped)" }, { status: 200 });
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

    if (eventName === "subscription_created") {
      const subData     = payload.data.attributes;
      const customData  = payload.meta.custom_data || {};

      const userId       = customData.user_id as string | undefined;
      const trialId      = customData.trial_id as string | undefined;
      const plan         = customData.plan as "BASIC" | "PRO" | undefined;
      const billingCycle = customData.billing_cycle as "MONTHLY" | "ANNUAL" | undefined;

      if (!userId || !trialId || !plan || !billingCycle) {
        console.error("[WEBHOOK] subscription_created: missing custom_data fields", customData);
        return NextResponse.json({ error: "Missing custom data" }, { status: 422 });
      }

      const lsSubscriptionId = payload.data.id.toString();
      const lsVariantId      = subData.variant_id?.toString() || "";
      const renewsAt         = subData.renews_at
        ? new Date(subData.renews_at)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        userId,
        trialId:          trialId || null,
        plan,
        billingCycle,
        status:           "ACTIVE",
        lsSubscriptionId,
        lsVariantId,
        currentPeriodEnd: renewsAt,
      });

      if (trialId) {
        await db
          .update(maintenanceTrials)
          .set({ status: "CONVERTED" })
          .where(eq(maintenanceTrials.id, trialId));
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.email) {
        const { sendSubscriptionConfirmedEmail } = await import("@/lib/email");
        await sendSubscriptionConfirmedEmail(
          user.email,
          user.name || "there",
          plan,
          billingCycle,
          renewsAt
        );
      }
    }

    return NextResponse.json({ message: "Webhook processed gracefully." }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
