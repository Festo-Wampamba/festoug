import { BlogCard } from "@/components/blog/blog-card";
import { withRetry } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  description: "Articles on software development, technology, and engineering by Festo Wampamba.",
};

export default async function BlogPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const postsPerPage = 6;

  // Total count of published posts
  const [{ value: totalPosts }] = await withRetry((db) =>
    db.select({ value: count() }).from(blogPosts).where(eq(blogPosts.isPublished, true))
  );

  const totalPages = Math.ceil(totalPosts / postsPerPage) || 1;
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const offset = (page - 1) * postsPerPage;

  // Fetch actual posts
  const posts = await withRetry((db) =>
    db.query.blogPosts.findMany({
      where: eq(blogPosts.isPublished, true),
      orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
      limit: postsPerPage,
      offset,
    })
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Blog
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12 border border-jet bg-eerie-black-1 rounded-2xl">
          <p className="text-light-gray">No blog posts found at the moment. Check back soon!</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-[30px] mb-10">
          {posts.map((post) => {
            const dateStr = (post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <BlogCard
                key={post.id}
                title={post.title}
                category={post.category || "Uncategorized"}
                date={dateStr}
                image={post.coverImage || "/images/blog-placeholder.jpg"}
                description={post.excerpt || ""}
                link={`/blog/${post.slug}`}
                isFeatured={post.isFeatured}
              />
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-8">
          <ul className="flex items-center gap-2">
            <li>
              {page > 1 ? (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="flex items-center gap-1 text-orange-yellow-crayola bg-transparent border border-jet px-4 py-2 rounded-lg hover:bg-jet transition-colors text-[13px] font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-light-gray-70 border border-jet px-4 py-2 rounded-lg opacity-50 cursor-not-allowed text-[13px] font-medium">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </span>
              )}
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num} className="hidden sm:block">
                <Link
                  href={`/blog?page=${num}`}
                  className={`flex items-center justify-center w-9 h-9 border border-jet rounded-lg transition-colors text-[13px] font-medium ${
                    page === num
                      ? "text-orange-yellow-crayola bg-border-gradient-onyx border-orange-yellow-crayola/30 shadow-1"
                      : "text-light-gray hover:bg-jet"
                  }`}
                >
                  {num}
                </Link>
              </li>
            ))}

            <li>
              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="flex items-center gap-1 text-orange-yellow-crayola bg-transparent border border-jet px-4 py-2 rounded-lg hover:bg-jet transition-colors text-[13px] font-medium"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-light-gray-70 border border-jet px-4 py-2 rounded-lg opacity-50 cursor-not-allowed text-[13px] font-medium">
                  Next <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
