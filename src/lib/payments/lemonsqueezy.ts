import { 
  lemonSqueezySetup, 
  createCheckout, 
  type Checkout,
} from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";

/**
 * Initializes the Lemon Squeezy SDK with the API key from environment variables.
 */
export function setupLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LEMONSQUEEZY_API_KEY environment variable");
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
  });
}

/**
 * Creates a checkout session for a specific variant (product/service pricing tier).
 * @param variantId The specific variant ID from your Lemon Squeezy Store
 * @param customData Optional custom data to attach to the order (e.g. userId, projectId, scoping details)
 */
export async function generateCheckoutLink(
  variantId: string,
  storeId: string = process.env.LEMONSQUEEZY_STORE_ID!,
  customData?: Record<string, string>
): Promise<string> {
  setupLemonSqueezy();

  if (!storeId) {
    throw new Error("Missing LEMONSQUEEZY_STORE_ID in environment variables");
  }

  const { error, data } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false, // Set to true if using the LS overlay widget
      media: true,
      logo: true,
    },
    checkoutData: {
      custom: customData, // This comes back in the webhook payload
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      receiptButtonText: "Return to Dashboard",
      receiptThankYouNote: "Thank you for getting started with FestoUG. I'll be in touch shortly!",
    },
  });

  if (error) {
    throw new Error(`Failed to create Lemon Squeezy checkout: ${error.message}`);
  }

  return data?.data.attributes.url || "";
}

/**
 * Validates the webhook signature from Lemon Squeezy.
 * @param payload The raw text body of the webhook request
 * @param signature The signature from the 'x-signature' header
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing LEMONSQUEEZY_WEBHOOK_SECRET environment variable");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(payload).digest("hex"), "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  try {
    return crypto.timingSafeEqual(digest, signatureBuffer);
  } catch (err) {
    return false;
  }
}

// ─── Subscription Variant Map ─────────────────────────────────────────────────

type MaintenancePlan = "BASIC" | "PRO";
type BillingCycle = "MONTHLY" | "ANNUAL";

export function getSubscriptionVariantId(
  plan: MaintenancePlan,
  billingCycle: BillingCycle
): string {
  const map: Record<`${MaintenancePlan}_${BillingCycle}`, string> = {
    BASIC_MONTHLY: process.env.LS_VARIANT_BASIC_MONTHLY!,
    BASIC_ANNUAL:  process.env.LS_VARIANT_BASIC_ANNUAL!,
    PRO_MONTHLY:   process.env.LS_VARIANT_PRO_MONTHLY!,
    PRO_ANNUAL:    process.env.LS_VARIANT_PRO_ANNUAL!,
  };

  const variantId = map[`${plan}_${billingCycle}`];
  if (!variantId) {
    throw new Error(
      `Missing LS variant ID for ${plan} ${billingCycle}. Set LS_VARIANT_${plan}_${billingCycle} in env.`
    );
  }
  return variantId;
}

/**
 * Generates a Lemon Squeezy subscription checkout URL.
 */
export async function getSubscriptionCheckoutUrl(
  plan: MaintenancePlan,
  billingCycle: BillingCycle,
  userId: string,
  trialId: string
): Promise<string> {
  const variantId = getSubscriptionVariantId(plan, billingCycle);

  return generateCheckoutLink(
    variantId,
    process.env.LEMONSQUEEZY_STORE_ID!,
    {
      user_id:       userId,
      trial_id:      trialId,
      plan,
      billing_cycle: billingCycle,
    }
  );
}
