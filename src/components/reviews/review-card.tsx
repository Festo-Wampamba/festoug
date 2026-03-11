import { Star, ThumbsUp } from "lucide-react";
import { HelpfulButton } from "./helpful-button";

interface ReviewCardProps {
  id: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  isOwnReview: boolean;
  hasVoted: boolean;
  isAuthenticated: boolean;
}

export function ReviewCard({
  id,
  userName,
  userImage,
  rating,
  title,
  body,
  helpfulCount,
  createdAt,
  isOwnReview,
  hasVoted,
  isAuthenticated,
}: ReviewCardProps) {
  return (
    <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-eerie-black-2 border border-jet flex items-center justify-center shrink-0 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-orange-yellow-crayola font-bold text-sm">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-white-2 font-medium text-sm">{userName}</span>
            <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">
              Verified Purchase
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= rating
                      ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                      : "text-jet"
                  }`}
                />
              ))}
            </div>
            <span className="text-light-gray-70 text-xs">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h4 className="text-white-2 font-semibold text-sm mb-1">{title}</h4>
          <p className="text-light-gray text-sm leading-relaxed">{body}</p>

          <div className="mt-4 flex items-center gap-3">
            {!isOwnReview && isAuthenticated && (
              <HelpfulButton
                reviewId={id}
                initialCount={helpfulCount}
                initialVoted={hasVoted}
              />
            )}
            {(isOwnReview || !isAuthenticated) && helpfulCount > 0 && (
              <span className="text-light-gray-70 text-xs flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                {helpfulCount} found helpful
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
