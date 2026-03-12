"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    category: string;
    variantId: string;
    downloadUrl: string;
    thumbnailUrl: string;
    isActive: boolean;
  };
}

const categories = ["SCRIPT", "TEMPLATE", "PLUGIN", "SERVICE", "OTHER"];

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      description: fd.get("description"),
      price: fd.get("price"),
      category: fd.get("category"),
      variantId: fd.get("variantId") || null,
      downloadUrl: fd.get("downloadUrl") || null,
      thumbnailUrl: fd.get("thumbnailUrl") || null,
      isActive: fd.get("isActive") === "on",
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${initialData!.id}`
        : "/api/admin/products";
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

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-jet text-white-2 text-sm font-light px-4 py-3 rounded-xl outline-none focus:border-orange-yellow-crayola transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Product Name *
          </label>
          <input name="name" required defaultValue={initialData?.name} className={inputClass} placeholder="e.g. Next.js SaaS Starter" />
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Slug *
          </label>
          <input name="slug" required defaultValue={initialData?.slug} className={inputClass} placeholder="e.g. nextjs-saas-starter" />
        </div>
      </div>

      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Description
        </label>
        <textarea name="description" rows={4} defaultValue={initialData?.description} className={inputClass} placeholder="Describe the product..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Price (USD) *
          </label>
          <input name="price" type="number" step="0.01" required defaultValue={initialData?.price} className={inputClass} placeholder="29.99" />
        </div>
        <div>
          <label htmlFor="product-category" className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Category *
          </label>
          <select id="product-category" name="category" required defaultValue={initialData?.category || "OTHER"} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-eerie-black-2">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Lemon Squeezy Variant ID
          </label>
          <input name="variantId" defaultValue={initialData?.variantId} className={inputClass} placeholder="e.g. 123456" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Download URL
          </label>
          <input name="downloadUrl" defaultValue={initialData?.downloadUrl} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Thumbnail URL
          </label>
          <input name="thumbnailUrl" defaultValue={initialData?.thumbnailUrl} className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" name="isActive" id="isActive" defaultChecked={initialData?.isActive ?? true} className="w-4 h-4 accent-orange-yellow-crayola" />
        <label htmlFor="isActive" className="text-light-gray text-sm">Active (visible in store)</label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
