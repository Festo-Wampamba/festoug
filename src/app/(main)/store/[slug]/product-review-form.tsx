"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/reviews/review-form";

export function ProductReviewForm({
  productId,
  orderId,
}: {
  productId: string;
  orderId: string;
}) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-orange-yellow-crayola/90 transition-colors"
      >
        Write a Review
      </button>
    );
  }

  return (
    <ReviewForm
      productId={productId}
      orderId={orderId}
      onClose={() => setShowForm(false)}
    />
  );
}
