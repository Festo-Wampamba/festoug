import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maintenanceTrials } from "@/lib/db/schema";
import { eq, and, isNull, lte, gt } from "drizzle-orm";
import { sendTrialReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const expiringTrials = await db.query.maintenanceTrials.findMany({
    where: and(
      eq(maintenanceTrials.status, "ACTIVE"),
      gt(maintenanceTrials.trialEndsAt, now),
      lte(maintenanceTrials.trialEndsAt, twoDaysFromNow),
      isNull(maintenanceTrials.notifiedAt)
    ),
    with: { user: true },
  });

  let notified = 0;
  const errors: string[] = [];

  for (const trial of expiringTrials) {
    try {
      await sendTrialReminderEmail(
        trial.user.email,
        trial.user.name || "there",
        trial.plan,
        trial.id,
        trial.trialEndsAt
      );

      await db
        .update(maintenanceTrials)
        .set({ notifiedAt: new Date() })
        .where(eq(maintenanceTrials.id, trial.id));

      notified++;
    } catch (err: any) {
      errors.push(`Trial ${trial.id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    message: `Notified ${notified} of ${expiringTrials.length} expiring trials.`,
    errors: errors.length > 0 ? errors : undefined,
  });
}
