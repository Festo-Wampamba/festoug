import { NextResponse } from "next/server";
import { getSubscriptionVariantId, verifyWebhookSignature } from "@/lib/payments/lemonsqueezy";
import { db } from "@/lib/db";
import { orders, licenses, products, users, subscriptions, maintenanceTrials } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";

// Payload values are attacker-influenced. Strip every control and line-separator
// character (not just CR/LF — U+0085, U+2028 and U+2029 also break lines in some
// log viewers) and cap the length, so they cannot forge or flood log entries.
const forLog = (value: unknown) =>
  String(value).replace(/\r|\n/g, "").replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ").slice(0, 200);

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

      // Idempotency: LS retries webhooks and can deliver the same event more than
      // once. An existing order is reused, never inserted twice — but we still
      // fall through, so a retry can issue the license a failed first attempt missed.
      const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.externalOrderId, externalOrderId),
      });

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
        console.warn("[WEBHOOK] order_created (ID: %s) has no product_slug in custom_data. Skipping order record. Custom data: %s", forLog(externalOrderId), forLog(JSON.stringify(customData)));
        return NextResponse.json({ message: "Order acknowledged (no product_slug — skipped)" }, { status: 200 });
      }

      const product = await db.query.products.findFirst({
        where: eq(products.slug, productSlug)
      });

      if (!product) {
        // Product slug sent but not found in DB. Log and acknowledge — returning 500 would
        // cause LS to retry indefinitely; 200 lets us handle it via manual reconciliation.
        console.error(`[WEBHOOK] order_created: product slug '${forLog(productSlug)}' not found in DB. Order ID: ${forLog(externalOrderId)}. Add the product via /admin/products/new or /admin/ls-sync, then replay this order.`);
        return NextResponse.json({ message: "Order acknowledged (product not in DB — skipped)" }, { status: 200 });
      }

      // custom_data is buyer-controllable (LS buy links accept it as URL params), so
      // product_slug alone proves nothing. Only fulfil when the variant LS actually
      // charged for is this product's variant — otherwise paying for the cheapest
      // variant with a forged slug would unlock any product.
      const paidVariantId = orderData.first_order_item?.variant_id;
      if (!product.variantId || String(paidVariantId) !== product.variantId) {
        console.error(`[WEBHOOK] order_created: variant mismatch for order ${forLog(externalOrderId)}. Paid variant '${forLog(paidVariantId)}', but product '${forLog(productSlug)}' expects '${product.variantId}'. Not fulfilled — reconcile manually.`);
        return NextResponse.json({ message: "Order acknowledged (variant mismatch — not fulfilled)" }, { status: 200 });
      }

      const order =
        existingOrder ??
        (
          await db.insert(orders).values({
            userId,
            productId: product.id,
            gateway: "LEMONSQUEEZY",
            externalOrderId,
            status: "COMPLETED",
            amount,
            currency,
          }).returning()
        )[0];

      // Digital products (script / template / plugin) get exactly one license per order.
      const isLicensed = product.category === "SCRIPT" || product.category === "TEMPLATE" || product.category === "PLUGIN";
      if (isLicensed && userId) {
        const existingLicense = await db.query.licenses.findFirst({
          where: eq(licenses.orderId, order.id),
        });
        if (!existingLicense) {
          await db.insert(licenses).values({
            orderId: order.id,
            userId,
            productId: product.id,
            licenseKey: crypto.randomBytes(16).toString("hex").toUpperCase(),
            isActive: true,
          });
        }
      }
    }

    // A refund takes the purchase back: mark the order and switch off its license.
    if (eventName === "order_refunded") {
      const [refunded] = await db
        .update(orders)
        .set({ status: "REFUNDED" })
        .where(eq(orders.externalOrderId, payload.data.id.toString()))
        .returning({ id: orders.id });
      if (refunded) {
        await db.update(licenses).set({ isActive: false }).where(eq(licenses.orderId, refunded.id));
      }
    }

    // Keep our subscription row in step with Lemon Squeezy after creation.
    if (
      eventName === "subscription_updated" ||
      eventName === "subscription_cancelled" ||
      eventName === "subscription_resumed" ||
      eventName === "subscription_expired"
    ) {
      const subData = payload.data.attributes;
      // LS statuses: on_trial, active, paused, past_due, unpaid, cancelled, expired.
      // "cancelled" keeps access until ends_at; LS then sends "expired".
      // ponytail: paused / past_due stay ACTIVE (grace). Add a status if they must lock access.
      const status =
        subData.status === "expired" || subData.status === "unpaid"
          ? ("EXPIRED" as const)
          : subData.status === "cancelled"
          ? ("CANCELLED" as const)
          : ("ACTIVE" as const);
      const periodEnd = subData.ends_at ?? subData.renews_at;

      await db
        .update(subscriptions)
        .set({
          status,
          ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
          ...(status === "ACTIVE" ? { cancelledAt: null } : {}),
          ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd) } : {}),
        })
        .where(eq(subscriptions.lsSubscriptionId, payload.data.id.toString()));
    }

    if (eventName === "subscription_created") {
      const subData     = payload.data.attributes;
      const customData  = payload.meta.custom_data || {};

      const userId       = customData.user_id as string | undefined;
      const trialId      = customData.trial_id as string | undefined;
      const plan         = customData.plan as "BASIC" | "PRO" | undefined;
      const billingCycle = customData.billing_cycle as "MONTHLY" | "ANNUAL" | undefined;

      if (!userId || !trialId || !plan || !billingCycle) {
        console.error("[WEBHOOK] subscription_created: missing custom_data fields", forLog(JSON.stringify(customData)));
        return NextResponse.json({ error: "Missing custom data" }, { status: 422 });
      }

      const lsSubscriptionId = payload.data.id.toString();

      // Idempotency: skip if this subscription is already recorded (LS retries).
      const existingSub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.lsSubscriptionId, lsSubscriptionId),
      });
      if (existingSub) {
        return NextResponse.json({ message: "Subscription already processed" }, { status: 200 });
      }

      const lsVariantId      = subData.variant_id?.toString() || "";

      // Same rule as orders: plan, user_id and trial_id arrive in buyer-controllable
      // custom_data. Only activate when LS charged the variant for the claimed plan
      // and the trial really belongs to that user.
      let expectedVariantId: string | undefined;
      try {
        expectedVariantId = getSubscriptionVariantId(plan, billingCycle as "ANNUAL");
      } catch {
        expectedVariantId = undefined; // unknown plan / billing cycle combination
      }
      const ownTrial = await db.query.maintenanceTrials.findFirst({
        where: and(eq(maintenanceTrials.id, trialId), eq(maintenanceTrials.userId, userId)),
      });
      if (!expectedVariantId || lsVariantId !== expectedVariantId || !ownTrial) {
        console.error(`[WEBHOOK] subscription_created: rejected subscription ${forLog(lsSubscriptionId)}. Paid variant '${forLog(lsVariantId)}', claimed plan '${forLog(plan)}/${forLog(billingCycle)}' expects '${expectedVariantId}', trial owned by user: ${!!ownTrial}. Not activated — reconcile manually.`);
        return NextResponse.json({ message: "Subscription acknowledged (variant or trial mismatch — not activated)" }, { status: 200 });
      }
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
  } catch (error) {
    console.error("Webhook processing error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
