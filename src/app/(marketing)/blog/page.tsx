import { BlogCard } from "@/components/blog/blog-card";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function BlogPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const postsPerPage = 4;

  const blogsPath = path.join(process.cwd(), "public", "blogs.json");
  const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));

  const totalPages = Math.ceil(blogs.length / postsPerPage);
  
  // Guard against invalid ranges
  const page = Math.max(1, Math.min(currentPage, totalPages));

  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Blog
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-[30px] mb-10">
        {currentPosts.map((post: any, index: number) => (
          <BlogCard
            key={index}
            title={post.title}
            category={post.category}
            date={post.date}
            image={post.image}
            description={post.description}
            link={post.link}
          />
        ))}
      </ul>

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
