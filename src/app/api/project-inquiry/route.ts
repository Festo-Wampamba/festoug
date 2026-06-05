import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectInquiries } from "@/lib/db/schema";
import { sendProjectInquiryNotification } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { projectInquirySchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    // Public, unauthenticated endpoint — rate limit to prevent spam / DB flooding
    // / admin email bombing.
    const ip = getClientIp(req);
    const limiter = rateLimit(`project-inquiry:${ip}`, { limit: 3, windowSeconds: 900 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = projectInquirySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, email, company, plan, timeline, vision } = parsed.data;

    const [inquiry] = await db.insert(projectInquiries).values({
      name,
      email: email.toLowerCase(),
      company: company || null,
      plan,
      timeline,
      vision,
      status: "NEW",
    }).returning();

    // Send email notification to admin — don't fail the request if email fails
    try {
      await sendProjectInquiryNotification({ name, email, company, plan, timeline, vision });
    } catch (emailErr) {
      console.error("[project-inquiry] Failed to send admin notification email:", emailErr);
    }

    return NextResponse.json({ id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/project-inquiry]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
