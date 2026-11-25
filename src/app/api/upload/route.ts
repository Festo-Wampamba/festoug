import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { cloudinary, detectImageMime } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
// SVG intentionally excluded — SVG can embed executable JavaScript.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed. Accepted: JPEG, PNG, GIF, WebP.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify the declared Content-Type matches the actual file bytes.
    // Prevents an attacker (or compromised admin) from uploading non-image
    // payloads with a forged Content-Type header.
    const detectedType = detectImageMime(buffer);
    if (!detectedType || !ALLOWED_TYPES.has(detectedType)) {
      return NextResponse.json(
        { error: "File contents do not match a supported image format." },
        { status: 400 }
      );
    }

    const base64 = `data:${detectedType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "festoug",
      resource_type: "image",
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Log full detail server-side; return a generic message so backend/provider
    // internals are not disclosed to the client.
    console.error("Upload Error:", message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
