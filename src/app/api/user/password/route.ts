import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { changePasswordSchema } from "@/lib/validations";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountStatus === "BANNED" || session.user.accountStatus === "SUSPENDED") {
      return NextResponse.json({ error: "Your account cannot be modified." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const [user] = await withRetry((db) =>
      db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Your account uses social sign-in. Use Forgot Password to set a password." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await withRetry((db) =>
      db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, session.user.id))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
