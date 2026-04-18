import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cloudinary } from "@/lib/cloudinary";
import { avatarUploadSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountStatus === "BANNED" || session.user.accountStatus === "SUSPENDED") {
      return NextResponse.json({ error: "Your account cannot be modified." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = avatarUploadSchema.safeParse({
      mimeType: file.type,
      sizeBytes: file.size,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "festoug/avatars",
      resource_type: "image",
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    });

    await withRetry((db) =>
      db
        .update(users)
        .set({ image: result.secure_url })
        .where(eq(users.id, session.user.id))
    );

    return NextResponse.json({ imageUrl: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error("[AVATAR_UPLOAD]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
