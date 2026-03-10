import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/blog-form";
import { Pencil, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin | Edit Blog Post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to Blog Posts
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="bg-orange-yellow-crayola/10 border border-orange-yellow-crayola/20 p-2.5 rounded-xl text-orange-yellow-crayola">
          <Pencil className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-white-2 text-xl font-bold">Edit Post</h2>
          <p className="text-light-gray-70 text-xs truncate max-w-sm">{post.title}</p>
        </div>
      </div>
      
      <div className="bg-eerie-black-1 border border-jet p-6 rounded-2xl shadow-1">
        <BlogForm
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content || "",
            excerpt: post.excerpt || "",
            coverImage: post.coverImage || "",
            category: post.category || "",
            isPublished: post.isPublished,
            isFeatured: post.isFeatured,
          }}
        />
      </div>
    </div>
  );
}
