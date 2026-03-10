"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteBlogButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete post.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="p-2 rounded-lg hover:bg-red-500/10 text-light-gray hover:text-red-400 transition-colors disabled:opacity-50"
      title="Delete Post"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
