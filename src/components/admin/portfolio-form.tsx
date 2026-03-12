"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";

interface PortfolioFormProps {
  project?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    image: string | null;
    description: string | null;
    liveUrl: string | null;
    repoUrl: string | null;
    isFeatured: boolean;
    sortOrder: number;
    isActive: boolean;
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function PortfolioForm({ project }: PortfolioFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!project;
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched && !isEdit) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title,
      slug,
      category: form.get("category") as string,
      description: (form.get("description") as string) || null,
      image: (form.get("image") as string) || null,
      liveUrl: (form.get("liveUrl") as string) || null,
      repoUrl: (form.get("repoUrl") as string) || null,
      isFeatured: form.get("isFeatured") === "on",
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder")) || 0,
    };

    try {
      const url = isEdit
        ? `/api/admin/portfolio/${project.id}`
        : "/api/admin/portfolio";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(isEdit ? "Project updated" : "Project created");
        router.push("/admin/portfolio");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save project");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        router.push("/admin/portfolio");
        router.refresh();
      } else {
        toast.error("Failed to delete project");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-light-gray text-sm font-medium mb-2">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-light-gray text-sm font-medium mb-2">Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-light-gray text-sm font-medium mb-2">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          required
          defaultValue={project?.category || ""}
          placeholder="e.g. Web development"
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-light-gray text-sm font-medium mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={project?.description || ""}
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors resize-none"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-light-gray text-sm font-medium mb-2">Image URL</label>
        <input
          id="image"
          name="image"
          type="text"
          defaultValue={project?.image || ""}
          placeholder="images/project-1.jpg"
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="liveUrl" className="block text-light-gray text-sm font-medium mb-2">Live URL</label>
          <input
            id="liveUrl"
            name="liveUrl"
            type="text"
            defaultValue={project?.liveUrl || ""}
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
        <div>
          <label htmlFor="repoUrl" className="block text-light-gray text-sm font-medium mb-2">Repository URL</label>
          <input
            id="repoUrl"
            name="repoUrl"
            type="text"
            defaultValue={project?.repoUrl || ""}
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-light-gray text-sm font-medium mb-2">Sort Order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={project?.sortOrder ?? 0}
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input
            id="isFeatured"
            name="isFeatured"
            type="checkbox"
            defaultChecked={project?.isFeatured ?? false}
            className="w-4 h-4 rounded accent-orange-yellow-crayola"
          />
          <label htmlFor="isFeatured" className="text-light-gray text-sm">Featured</label>
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={project?.isActive ?? true}
            className="w-4 h-4 rounded accent-orange-yellow-crayola"
          />
          <label htmlFor="isActive" className="text-light-gray text-sm">Active</label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-yellow-crayola text-smoky-black px-8 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-red-400 px-6 py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
