"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ReviewForm } from "@/components/reviews/review-form";
import { useToast } from "@/components/ui/toast-provider";

interface MyReviewActionsProps {
  review: {
    id: string;
    rating: number;
    title: string;
    body: string;
    productId: string;
    orderId: string;
  };
}

export function MyReviewActions({ review }: MyReviewActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete review");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="w-full mt-4 border-t border-jet pt-4">
        <ReviewForm
          productId={review.productId}
          orderId={review.orderId}
          existingReview={{
            id: review.id,
            rating: review.rating,
            title: review.title,
            body: review.body,
          }}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => setEditing(true)}
        className="p-2 rounded-lg hover:bg-orange-yellow-crayola/10 text-orange-yellow-crayola transition-colors"
        title="Edit review"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
        title="Delete review"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
