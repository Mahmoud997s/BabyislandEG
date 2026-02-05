import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";
import { Product } from "@/data/products";

interface MinimalProductCardProps {
    product: Product;
}

export function MinimalProductCard({ product }: MinimalProductCardProps) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    // Localization helper
    const displayName = (isRtl && product.name_ar) ? product.name_ar : product.name;
    const displayPrice = product.price;
    const compareAtPrice = product.compareAtPrice;

    // Calculate discount percentage if needed
    const discountPercentage = compareAtPrice
        ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)
        : 0;

    return (
        <LocaleLink to={`/product/${product.id}`} className="group block h-full">
            {/* Image Container */}
            <div className="aspect-[1/1.1] bg-[#F0EEED] rounded-[20px] overflow-hidden mb-4 relative">
                <img
                    src={product.images?.[0] || ""}
                    alt={displayName}
                    className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge matching the reference design style if present */}
                {discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 bg-[#FF3333]/10 text-[#FF3333] text-xs font-bold px-2 py-1 rounded-full">
                        -{discountPercentage}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                <h3 className="font-bold text-lg leading-tight truncate text-foreground">
                    {displayName}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "w-4 h-4",
                                i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300",
                            )}
                        />
                    ))}
                    <span className="text-sm text-foreground/60 ml-1">
                        {product.rating}/5
                    </span>
                </div>

                {/* Price */}
                <PriceDisplay
                    price={displayPrice}
                    compareAtPrice={compareAtPrice}
                    // We handle badge in image, so passing 0 here to hide default badge if unwanted, 
                    // OR we can leave it. The reference had badge next to price? 
                    // My previous NewArrival implementation put it in PriceDisplay.
                    // The reference image has badge NEXT TO PRICE (pink pill).
                    // I will let PriceDisplay handle it if it does it well.
                    discountPercentage={discountPercentage}
                    size="md"
                    className="justify-start mt-1"
                />
            </div>
        </LocaleLink>
    );
}
