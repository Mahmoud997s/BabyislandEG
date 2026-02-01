import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const fillPercentage = Math.min(100, Math.max(0, (rating - i) * 100));
    return { index: i, fillPercentage };
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {stars.map(({ index, fillPercentage }) => (
          <div key={index} className="relative">
            <Star
              className={cn(sizeClasses[size], "text-muted fill-muted")}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(sizeClasses[size], "text-warning fill-warning")}
              />
            </div>
          </div>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground mr-1">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
