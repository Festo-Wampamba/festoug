"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "./star-rating-input";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    body: string;
  };
  onClose?: () => void;
}

export function ReviewForm({ productId, orderId, existingReview, onClose }: ReviewFormProps) {
  const router = useRouter();
  const isEdit = !!existingReview;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const body = form.get("body") as string;

    try {
      const url = isEdit
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { rating, title, body }
            : { productId, orderId, rating, title, body }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      router.refresh();
      onClose?.();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-light-gray text-sm font-medium mb-2">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="block text-light-gray text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          defaultValue={existingReview?.title}
          placeholder="Summarize your experience"
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-light-gray text-sm font-medium mb-2">
          Review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          defaultValue={existingReview?.body}
          placeholder="Share your thoughts about this product..."
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-light-gray-70 px-6 py-3 rounded-xl text-sm hover:text-white-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {rating > 0 && rating < 3 && (
        <p className="text-light-gray-70 text-xs">
          Reviews with 1-2 stars are reviewed by our team before publishing.
        </p>
      )}
    </form>
  );
}
