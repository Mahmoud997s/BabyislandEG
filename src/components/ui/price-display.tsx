import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showCurrency?: boolean;
}

const sizeClasses = {
  sm: {
    current: "text-base font-bold",
    compare: "text-xs",
    discount: "text-xs px-1.5 py-0.5",
  },
  md: {
    current: "text-lg font-bold",
    compare: "text-sm",
    discount: "text-xs px-2 py-0.5",
  },
  lg: {
    current: "text-2xl font-bold",
    compare: "text-base",
    discount: "text-sm px-2 py-1",
  },
  xl: {
    current: "text-3xl font-bold",
    compare: "text-lg",
    discount: "text-base px-3 py-1",
  },
};

export function PriceDisplay({
  price,
  compareAtPrice,
  discountPercentage,
  size = "md",
  className,
  showCurrency = true,
}: PriceDisplayProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString("ar-EG");
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn(classes.current, "text-primary")}>
        {formatPrice(price)}
        {showCurrency && <span className="text-sm font-normal mr-1">ج.م</span>}
      </span>
      
      {compareAtPrice && compareAtPrice > price && (
        <span className={cn(classes.compare, "text-muted-foreground line-through")}>
          {formatPrice(compareAtPrice)}
        </span>
      )}
      
      {discountPercentage && discountPercentage > 0 && (
        <span className={cn(
          classes.discount,
          "bg-destructive text-destructive-foreground rounded-full font-semibold"
        )}>
          -{discountPercentage}%
        </span>
      )}
    </div>
  );
}
