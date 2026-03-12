import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { blogPostSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // Check slug uniqueness
  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, data.slug),
  });
  if (existing) {
    return NextResponse.json(
      { error: "A blog post with this slug already exists." },
      { status: 409 }
    );
  }

  const [newPost] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content || null,
      category: data.category || null,
      coverImage: data.coverImage || null,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      authorId: session.user.id,
      publishedAt: data.isPublished ? new Date() : null,
    })
    .returning();

  return NextResponse.json(newPost, { status: 201 });
}
