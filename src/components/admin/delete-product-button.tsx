"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm(`Delete "${productName}"? This action is irreversible.`)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete product");
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
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
