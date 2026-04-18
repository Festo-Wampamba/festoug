"use server";

import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateProfileSchema } from "@/lib/validations";

export type ProfileActionState = {
  success?: boolean;
  error?: string;
} | null;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (session.user.accountStatus === "BANNED" || session.user.accountStatus === "SUSPENDED") {
    return { error: "Your account cannot be modified." };
  }

  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await withRetry((db) =>
    db
      .update(users)
      .set({ name: parsed.data.name })
      .where(eq(users.id, session.user.id))
  );

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
