import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { blogPostSchema } from "@/lib/validations";

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

  // Validate input
  const result = blogPostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.issues },
      { status: 400 }
    );
  }

  const data = result.data;

  // Check slug uniqueness (excluding current post)
  const existing = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, data.slug), ne(blogPosts.id, id)),
  });
  if (existing) {
    return NextResponse.json(
      { error: "A blog post with this slug already exists." },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(blogPosts)
    .set({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content || null,
      category: data.category || null,
      coverImage: data.coverImage || null,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      publishedAt: data.isPublished ? new Date() : null,
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
