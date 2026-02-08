"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface MinimalProductCardProps {
    product: Product;
}

export function MinimalProductCard({ product }: MinimalProductCardProps) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const addItem = useCartStore((state) => state.addItem);
    const [showQuickView, setShowQuickView] = useState(false);
    const defaultVariant = product.variants.find((v) => v.inStock) || product.variants[0];

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (defaultVariant.inStock) {
            addItem(product, defaultVariant);
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowQuickView(true);
    };

    // Localization helper
    const displayName = (isRtl && product.name_ar) ? product.name_ar : product.name;
    const displayPrice = product.price;
    const compareAtPrice = product.compareAtPrice;

    // Calculate discount percentage if needed
    const discountPercentage = compareAtPrice
        ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)
        : 0;

    return (
        <>
            <LocaleLink href={`/product/${product.id}`} className="group block h-full">
                {/* Image Container */}
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center p-2">
                    <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={displayName}
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                        }}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Discount Badge matching the reference design style if present */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-[#FF3333]/10 text-[#FF3333] text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                            -{discountPercentage}%
                        </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute bottom-2 left-2 flex gap-1.5 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full bg-white/90 text-foreground hover:bg-white hover:text-primary shadow-sm h-7 w-7"
                            onClick={handleAddToCart}
                            disabled={product.stockStatus === "out-of-stock"}
                            title={isRtl ? "إضافة للسلة" : "Add to Cart"}
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full bg-white/90 text-foreground hover:bg-white hover:text-primary shadow-sm h-7 w-7"
                            onClick={handleQuickView}
                            title={isRtl ? "معاينة سريعة" : "Quick View"}
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-1">
                    <h3 className="font-bold text-xs md:text-sm leading-tight truncate text-foreground">
                        {displayName}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "w-3 h-3",
                                    i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300",
                                )}
                            />
                        ))}
                        <span className="text-[10px] text-foreground/60 ml-1">
                            {product.rating}/5
                        </span>
                    </div>

                    {/* Price */}
                    <PriceDisplay
                        price={displayPrice}
                        compareAtPrice={compareAtPrice}
                        discountPercentage={discountPercentage}
                        size="sm"
                        className="justify-start mt-0.5"
                    />
                </div>
            </LocaleLink>
            <QuickViewModal
                product={product}
                isOpen={showQuickView}
                onClose={() => setShowQuickView(false)}
            />
        </>
    );
}
