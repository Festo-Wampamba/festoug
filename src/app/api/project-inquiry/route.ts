import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectInquiries } from "@/lib/db/schema";
import { sendProjectInquiryNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, plan, timeline, vision } = body as {
      name: string;
      email: string;
      company?: string;
      plan: string;
      timeline: string;
      vision: string;
    };

    if (!name || !email || !plan || !timeline || !vision) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [inquiry] = await db.insert(projectInquiries).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      plan,
      timeline,
      vision: vision.trim(),
      status: "NEW",
    }).returning();

    // Send email notification to admin — don't fail the request if email fails
    try {
      await sendProjectInquiryNotification({ name, email, company, plan, timeline, vision });
    } catch (emailErr) {
      console.error("[project-inquiry] Failed to send admin notification email:", emailErr);
    }

    return NextResponse.json({ id: inquiry.id }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/project-inquiry]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
