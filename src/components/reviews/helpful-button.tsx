"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  initialVoted: boolean;
}

export function HelpfulButton({ reviewId, initialCount, initialVoted }: HelpfulButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setVoted(data.voted);
        setCount((prev) => (data.voted ? prev + 1 : prev - 1));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
        voted
          ? "bg-orange-yellow-crayola/10 text-orange-yellow-crayola border-orange-yellow-crayola/20"
          : "text-light-gray-70 border-jet hover:text-white-2 hover:border-light-gray-70"
      }`}
    >
      <ThumbsUp className="w-3.5 h-3.5" />
      Helpful{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
