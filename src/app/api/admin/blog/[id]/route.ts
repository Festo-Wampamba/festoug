import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// UPDATE a blog post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(blogPosts)
    .set({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      category: body.category || null,
      coverImage: body.coverImage || null,
      isPublished: body.isPublished ?? false,
      isFeatured: body.isFeatured ?? false,
      publishedAt: body.isPublished ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE a blog post
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return NextResponse.json({ success: true });
}
