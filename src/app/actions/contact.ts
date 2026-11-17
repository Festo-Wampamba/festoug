"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientKey, getClientIp, globalKey, rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  fullname: z.string().trim().min(1, "Please enter your name.").max(100, "That name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  message: z.string().trim().min(1, "Please write a message.").max(5000, "That message is too long (5,000 characters max)."),
});

const GENERIC_ERROR = "Your message could not be sent. Please try again, or email me directly.";

export async function sendEmail(formData: FormData) {
  const parsed = contactSchema.safeParse({
    fullname: formData.get("fullname"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Per-visitor limit plus a site-wide ceiling that protects the EmailJS quota
  // even if a sender rotates IPs.
  const ip = getClientIp(await headers());
  // Sequential on purpose: a sender who is already over their own limit must
  // not also use up the shared ceiling.
  const allowed =
    (await rateLimit(clientKey("contact", ip), { limit: 5, windowSeconds: 600 })).success &&
    (await rateLimit(globalKey("contact"), { limit: 40, windowSeconds: 3600 })).success;
  if (!allowed) {
    return { error: "You have sent several messages in a short time. Please try again in a few minutes." };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID; // Public key
  const accessToken = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !userId) {
    console.error("[contact] EmailJS is not configured (EMAILJS_SERVICE_ID / TEMPLATE_ID / USER_ID).");
    return { error: GENERIC_ERROR };
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        accessToken,
        template_params: {
          from_name: parsed.data.fullname,
          from_email: parsed.data.email,
          message: parsed.data.message,
        },
      }),
    });

    if (!response.ok) {
      // Provider detail stays in the server log; the visitor gets a plain message.
      console.error("[contact] EmailJS rejected the message:", response.status, await response.text());
      return { error: GENERIC_ERROR };
    }

    return { success: true };
  } catch (error) {
    console.error("[contact] EmailJS request failed:", error instanceof Error ? error.message : String(error));
    return { error: GENERIC_ERROR };
  }
}
