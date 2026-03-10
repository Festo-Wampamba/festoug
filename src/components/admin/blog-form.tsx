"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ImagePlus, Loader2 } from "lucide-react";

interface BlogFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    category: string;
    isPublished: boolean;
    isFeatured: boolean;
  };
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImage || "");
  const isEdit = !!initialData?.id;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setCoverImageUrl(url);
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      excerpt: fd.get("excerpt") || null,
      category: fd.get("category") || null,
      coverImage: coverImageUrl || null,
      content,
      isPublished: fd.get("isPublished") === "on",
      isFeatured: fd.get("isFeatured") === "on",
    };

    try {
      const url = isEdit ? `/api/admin/blog/${initialData!.id}` : "/api/admin/blog";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-jet text-white-2 text-sm font-light px-4 py-3 rounded-xl outline-none focus:border-orange-yellow-crayola transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Upload & Thumbnail */}
      <div className="space-y-2">
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider block">
          Cover Image
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-64 aspect-video bg-eerie-black-1 border border-jet border-dashed relative rounded-xl overflow-hidden flex items-center justify-center">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-light-gray-70 text-xs flex flex-col items-center gap-2">
                <ImagePlus className="w-6 h-6" />
                <span>No Image Selected</span>
              </div>
            )}
          </div>
          <div className="flex-1 w-full space-y-3">
             <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-center gap-2 bg-jet/50 hover:bg-jet border border-jet text-light-gray px-4 py-2.5 rounded-xl text-sm transition-colors text-center w-full sm:w-auto overflow-hidden">
                  {uploadingImage ? (
                    <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> Uploading...</>
                  ) : (
                    <><ImagePlus className="w-4 h-4 shrink-0" /> Browse from Device</>
                  )}
                </div>
             </div>
             <p className="text-xs text-light-gray-70">
               Or provide a URL below:
             </p>
             <input
               type="text"
               value={coverImageUrl}
               onChange={(e) => setCoverImageUrl(e.target.value)}
               className={inputClass}
               placeholder="https://... or /images/..."
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Title *
          </label>
          <input name="title" required defaultValue={initialData?.title} className={inputClass} placeholder="My Awesome Post" />
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Slug *
          </label>
          <input name="slug" required defaultValue={initialData?.slug} className={inputClass} placeholder="my-awesome-post" />
        </div>
      </div>

      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Category
        </label>
        <input name="category" defaultValue={initialData?.category} className={inputClass} placeholder="e.g. Engineering, Design" />
      </div>

      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Excerpt / Short Description
        </label>
        <textarea name="excerpt" rows={2} defaultValue={initialData?.excerpt} className={inputClass} placeholder="A short summary for previews..." />
      </div>

      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Content *
        </label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 bg-eerie-black-1 border border-jet p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <input type="checkbox" name="isPublished" id="isPublished" defaultChecked={initialData?.isPublished ?? false} className="w-4 h-4 accent-orange-yellow-crayola" />
          <label htmlFor="isPublished" className="text-white-2 text-sm font-medium">Published (Visible to public)</label>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={initialData?.isFeatured ?? false} className="w-4 h-4 accent-orange-yellow-crayola" />
          <label htmlFor="isFeatured" className="text-white-2 text-sm font-medium">Featured (Highlight on homepage)</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-yellow-crayola/90 hover:shadow-[0_0_15px_rgba(255,181,63,0.3)] transition-all disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
      </button>
    </form>
  );
}
