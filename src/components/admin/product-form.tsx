"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

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
    screenshots: string[];
    isActive: boolean;
  };
}

const categories = ["SCRIPT", "TEMPLATE", "PLUGIN", "SERVICE", "OTHER"];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData?.id;

  // Controlled fields
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");
  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots ?? []);

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingShot, setUploadingShot] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const shotInputRef = useRef<HTMLInputElement>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!slugLocked) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugLocked(true);
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const { url } = await res.json();
    return url;
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadFile(file);
      setThumbnailUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thumbnail upload failed");
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingShot(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setScreenshots((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screenshot upload failed");
    } finally {
      setUploadingShot(false);
      if (shotInputRef.current) shotInputRef.current.value = "";
    }
  }

  function removeScreenshot(idx: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name,
      slug,
      description,
      price: fd.get("price"),
      category: fd.get("category"),
      variantId: fd.get("variantId") || null,
      downloadUrl: fd.get("downloadUrl") || null,
      thumbnailUrl: thumbnailUrl || null,
      screenshots,
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

      {/* Name + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Product Name *
          </label>
          <input
            required
            value={name}
            onChange={handleNameChange}
            className={inputClass}
            placeholder="e.g. Next.js SaaS Starter"
          />
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Slug *{" "}
            <span className="text-light-gray-70 normal-case font-normal ml-1 text-[10px]">
              auto-generated
            </span>
          </label>
          <input
            required
            value={slug}
            onChange={handleSlugChange}
            className={inputClass}
            placeholder="e.g. nextjs-saas-starter"
          />
        </div>
      </div>

      {/* Description — Tiptap */}
      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Description
        </label>
        <TiptapEditor
          content={description}
          onChange={setDescription}
          placeholder="Describe the product — supports headings, lists, code blocks…"
        />
      </div>

      {/* Price / Category / Variant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Price (USD) *
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={initialData?.price}
            className={inputClass}
            placeholder="29.99"
          />
        </div>
        <div>
          <label
            htmlFor="product-category"
            className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block"
          >
            Category *
          </label>
          <select
            id="product-category"
            name="category"
            required
            defaultValue={initialData?.category || "OTHER"}
            className={inputClass}
            aria-label="Product category"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-eerie-black-2">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
            Lemon Squeezy Variant ID
          </label>
          <input
            name="variantId"
            defaultValue={initialData?.variantId}
            className={inputClass}
            placeholder="e.g. 123456"
          />
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Thumbnail
        </label>
        <input
          ref={thumbInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          className="hidden"
          aria-label="Upload product thumbnail"
        />
        <div className="flex gap-4 items-start">
          <button
            type="button"
            onClick={() => thumbInputRef.current?.click()}
            disabled={uploadingThumb}
            className="w-32 h-32 shrink-0 border-2 border-dashed border-jet rounded-xl flex flex-col items-center justify-center gap-2 text-light-gray-70 hover:border-orange-yellow-crayola hover:text-orange-yellow-crayola transition-colors disabled:opacity-50 overflow-hidden relative"
            aria-label="Upload thumbnail"
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : uploadingThumb ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>

          <div className="flex-1 space-y-2">
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className={inputClass}
              placeholder="Or paste image URL…"
              aria-label="Thumbnail URL"
            />
            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => setThumbnailUrl("")}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove thumbnail
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Screenshots */}
      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Screenshots
        </label>
        <input
          ref={shotInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleScreenshotUpload}
          className="hidden"
          aria-label="Upload product screenshots"
        />
        <div className="flex flex-wrap gap-3">
          {screenshots.map((url, idx) => (
            <div key={idx} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Screenshot ${idx + 1}`}
                className="w-28 h-20 object-cover rounded-xl border border-jet"
              />
              <button
                type="button"
                onClick={() => removeScreenshot(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove screenshot ${idx + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => shotInputRef.current?.click()}
            disabled={uploadingShot}
            className="w-28 h-20 border-2 border-dashed border-jet rounded-xl flex flex-col items-center justify-center gap-1 text-light-gray-70 hover:border-orange-yellow-crayola hover:text-orange-yellow-crayola transition-colors disabled:opacity-50"
            aria-label="Add screenshots"
          >
            {uploadingShot ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
            <span className="text-xs">
              {uploadingShot ? "Uploading…" : "Add"}
            </span>
          </button>
        </div>
      </div>

      {/* Download URL */}
      <div>
        <label className="text-light-gray text-xs font-medium uppercase tracking-wider mb-1.5 block">
          Download URL
        </label>
        <input
          name="downloadUrl"
          defaultValue={initialData?.downloadUrl}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {/* Active */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          defaultChecked={initialData?.isActive ?? true}
          className="w-4 h-4 accent-orange-yellow-crayola"
        />
        <label htmlFor="isActive" className="text-light-gray text-sm">
          Active (visible in store)
        </label>
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
