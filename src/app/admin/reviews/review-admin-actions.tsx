"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function ReviewAdminActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "APPROVED" | "REJECTED" | "delete") {
    setLoading(true);
    try {
      if (action === "delete") {
        if (!confirm("Delete this review permanently?")) {
          setLoading(false);
          return;
        }
        await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/admin/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {status !== "APPROVED" && (
        <button
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
          title="Approve"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-orange-400/10 text-orange-400 transition-colors"
          title="Reject"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={() => handleAction("delete")}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
