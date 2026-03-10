import { BlogForm } from "@/components/admin/blog-form";
import { PenSquare, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin | New Blog Post" };

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to Blog Posts
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="bg-orange-yellow-crayola/10 border border-orange-yellow-crayola/20 p-2.5 rounded-xl text-orange-yellow-crayola">
          <PenSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-white-2 text-xl font-bold">Write a New Blog Post</h2>
          <p className="text-light-gray-70 text-xs">Create and publish content to your audience.</p>
        </div>
      </div>
      
      <div className="bg-eerie-black-1 border border-jet p-6 rounded-2xl shadow-1">
        <BlogForm />
      </div>
    </div>
  );
}
