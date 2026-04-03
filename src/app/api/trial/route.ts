import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceTrials, subscriptions } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { sendTrialWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, billingCycle, websiteUrl } = body as {
      plan:         "BASIC" | "PRO";
      billingCycle: "MONTHLY" | "ANNUAL";
      websiteUrl:   string;
    };

    if (!plan || !billingCycle || !websiteUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["BASIC", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["MONTHLY", "ANNUAL"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const existingTrial = await db.query.maintenanceTrials.findFirst({
      where: and(
        eq(maintenanceTrials.userId, session.user.id),
        or(
          eq(maintenanceTrials.status, "ACTIVE"),
          eq(maintenanceTrials.status, "CONVERTED")
        )
      ),
    });
    if (existingTrial) {
      return NextResponse.json(
        { error: "You already have an active trial or subscription." },
        { status: 409 }
      );
    }

    const existingSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, session.user.id),
        eq(subscriptions.status, "ACTIVE")
      ),
    });
    if (existingSub) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 409 }
      );
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [trial] = await db
      .insert(maintenanceTrials)
      .values({
        userId:        session.user.id,
        plan,
        billingCycle,
        websiteUrl,
        status:        "ACTIVE",
        trialStartsAt: now,
        trialEndsAt,
      })
      .returning();

    await sendTrialWelcomeEmail(
      session.user.email,
      session.user.name,
      plan,
      trialEndsAt
    );

    return NextResponse.json({ trialId: trial.id }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/trial]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
