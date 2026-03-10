import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const [newPost] = await db
    .insert(blogPosts)
    .values({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      category: body.category || null,
      coverImage: body.coverImage || null,
      isPublished: body.isPublished ?? false,
      isFeatured: body.isFeatured ?? false,
      authorId: session.user.id,
      publishedAt: body.isPublished ? new Date() : null,
    })
    .returning();

  return NextResponse.json(newPost, { status: 201 });
}
