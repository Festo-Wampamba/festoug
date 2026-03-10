import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { PenSquare, Eye, EyeOff, Pencil, Star, ChevronLeft } from "lucide-react";
import { DeleteBlogButton } from "@/components/admin/delete-blog-button";

export const metadata = { title: "Admin | Blog Posts" };

export default async function AdminBlogPage() {
  const posts = await db.query.blogPosts.findMany({
    with: { author: true },
    orderBy: (p, { desc: d }) => [d(p.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-white-2 text-xl font-bold">Blog Posts</h2>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            <PenSquare className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {posts.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">
            No blog posts yet. Click "New Post" to start writing.
          </p>
        ) : (
          <div className="divide-y divide-jet/50">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative flex items-center justify-between px-6 py-4 hover:bg-jet/20 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-light-gray-70 shrink-0" />
                    )}
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-white-2 font-medium truncate group-hover:text-orange-yellow-crayola transition-colors before:absolute before:inset-0"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <p className="text-light-gray-70 text-xs mt-1">
                    {post.category || "Uncategorized"} · {post.author?.name || "Unknown"} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                  <div className="flex gap-2">
                    {post.isFeatured && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-orange-yellow-crayola/20 text-orange-yellow-crayola px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-orange-yellow-crayola" /> Featured
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                        post.isPublished
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 relative z-10">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="p-2 rounded-lg hover:bg-jet text-light-gray hover:text-orange-yellow-crayola transition-colors"
                      title="Edit Post"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteBlogButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
