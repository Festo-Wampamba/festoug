"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { StarRatingInput } from "@/components/reviews/star-rating-input";

interface TestimonialFormProps {
  testimonial?: {
    id: string;
    name: string;
    avatar: string | null;
    role: string | null;
    rating: number;
    testimonial: string;
    isActive: boolean;
    sortOrder: number;
  };
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!testimonial;
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(testimonial?.rating || 5);
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatar || "");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      role: (form.get("role") as string) || null,
      avatar: avatarUrl || null,
      rating,
      testimonial: form.get("testimonial") as string,
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder")) || 0,
    };

    try {
      const url = isEdit
        ? `/api/admin/testimonials/${testimonial.id}`
        : "/api/admin/testimonials";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(isEdit ? "Testimonial updated" : "Testimonial created");
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save testimonial");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!testimonial || !confirm(`Delete testimonial from "${testimonial.name}"?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Testimonial deleted");
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        toast.error("Failed to delete testimonial");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-light-gray text-sm font-medium mb-2">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={testimonial?.name || ""}
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-light-gray text-sm font-medium mb-2">Role</label>
          <input
            id="role"
            name="role"
            type="text"
            defaultValue={testimonial?.role || ""}
            placeholder="e.g. CTO at Company"
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-light-gray text-sm font-medium mb-2">Avatar</label>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Paste URL or upload"
            className="flex-1 bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
          <label className="shrink-0 bg-jet text-light-gray px-4 py-3 rounded-xl text-sm cursor-pointer hover:text-white-2 transition-colors">
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          {avatarUrl && (
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-jet shrink-0">
              <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-light-gray text-sm font-medium mb-2">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="testimonial" className="block text-light-gray text-sm font-medium mb-2">Testimonial</label>
        <textarea
          id="testimonial"
          name="testimonial"
          required
          minLength={10}
          rows={4}
          defaultValue={testimonial?.testimonial || ""}
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-light-gray text-sm font-medium mb-2">Sort Order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={testimonial?.sortOrder ?? 0}
            className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm focus:outline-none focus:border-orange-yellow-crayola transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={testimonial?.isActive ?? true}
            className="w-4 h-4 rounded accent-orange-yellow-crayola"
          />
          <label htmlFor="isActive" className="text-light-gray text-sm">Active (visible on homepage)</label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-yellow-crayola text-smoky-black px-8 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Testimonial" : "Create Testimonial"}
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
