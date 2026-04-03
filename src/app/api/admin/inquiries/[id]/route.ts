import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectInquiries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPaymentAcknowledgmentEmail } from "@/lib/email";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Handle inquiry status update
  if ("status" in body) {
    const { status } = body;
    if (!["NEW", "REVIEWED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.update(projectInquiries).set({ status }).where(eq(projectInquiries.id, id));
    return NextResponse.json({ ok: true });
  }

  // Handle payment status update
  if ("paymentStatus" in body) {
    const { paymentStatus, paymentNote } = body;
    if (!["PENDING", "DEPOSIT_RECEIVED", "PAID_IN_FULL"].includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid paymentStatus" }, { status: 400 });
    }

    await db
      .update(projectInquiries)
      .set({ paymentStatus, paymentNote: paymentNote ?? null })
      .where(eq(projectInquiries.id, id));

    // Send acknowledgment email to client when payment is recorded
    if (paymentStatus !== "PENDING") {
      const [inquiry] = await db
        .select({ name: projectInquiries.name, email: projectInquiries.email, plan: projectInquiries.plan })
        .from(projectInquiries)
        .where(eq(projectInquiries.id, id));

      if (inquiry) {
        try {
          await sendPaymentAcknowledgmentEmail({
            name: inquiry.name,
            email: inquiry.email,
            plan: inquiry.plan,
            paymentStatus,
            paymentNote: paymentNote ?? null,
          });
        } catch {
          // Non-fatal — payment is already saved
        }
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "No valid field to update" }, { status: 400 });
}
