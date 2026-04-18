"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Camera } from "lucide-react";

const MAX_SIZE = 1_048_576; // 1MB
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function SettingsAvatarSection({
  initialImage,
  initialName,
}: {
  initialImage: string | null;
  initialName: string;
}) {
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("Only JPEG, PNG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 1MB.");
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setPreview(initialImage);
        return;
      }

      setPreview(data.imageUrl);
      await updateSession();
    } catch {
      setError("An unexpected error occurred.");
      setPreview(initialImage);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-6 pb-6 border-b border-jet">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-jet flex justify-center items-center overflow-hidden border border-jet">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-orange-yellow-crayola">
              {initialName?.charAt(0) || "U"}
            </span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-jet text-white-2 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-yellow-crayola hover:text-smoky-black transition-colors disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          {uploading ? "Uploading…" : "Change Avatar"}
        </button>
        <p className="text-light-gray-70 text-xs mt-2">JPG, GIF, PNG, or WebP. 1MB max.</p>
        {error && <p role="alert" className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
