"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { PriceDisplay } from "@/components/ui/price-display";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

import { useTranslation } from "react-i18next";

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const addItem = useCartStore((state) => state.addItem);
  const [showQuickView, setShowQuickView] = useState(false);
  const defaultVariant = product.variants.find((v) => v.inStock) || product.variants[0];

  const displayName = (isRtl && product.name_ar) ? product.name_ar : product.name;
  const displayDescription = (isRtl && product.description_ar) ? product.description_ar : product.description;

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn("group relative h-full", className)}
      >
        <LocaleLink href={`/product/${product.id}`} className="block h-full">
          <div className="glass rounded-2xl transition-all duration-300 hover:border-[#F97316]/50 hover:shadow-lg hover:-translate-y-1 overflow-hidden h-full flex flex-col group/card">
            {/* Image Container */}
            <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={defaultVariant.images[0] || "/placeholder.svg"}
                alt={displayName}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
                loading={priority ? "eager" : "lazy"}
                className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {product.discountPercentage && (
                  <Badge variant="sale">-{product.discountPercentage}%</Badge>
                )}
                {product.isNew && <Badge variant="new">جديد</Badge>}
                {product.isBestSeller && <Badge variant="bestSeller">الأكثر مبيعاً</Badge>}
                {product.isFeatured && <Badge variant="featured">مميز</Badge>}
              </div>

              {/* Stock Status */}
              {product.stockStatus === "out-of-stock" && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="outOfStock" className="text-base px-4 py-2">
                    نفد من المخزن
                  </Badge>
                </div>
              )}

              {product.stockStatus === "low-stock" && (
                <div className="absolute bottom-3 right-3">
                  <Badge variant="lowStock">كمية محدودة</Badge>
                </div>
              )}

              {/* Quick Actions */}
              <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-white/90 text-foreground backdrop-blur-md hover:bg-white hover:text-primary shadow-sm border border-gray-100"
                  onClick={handleAddToCart}
                  disabled={product.stockStatus === "out-of-stock"}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-white/90 text-foreground backdrop-blur-md hover:bg-white hover:text-primary shadow-sm border border-gray-100"
                  onClick={handleQuickView}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              {/* Brand */}
              <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>

              {/* Name */}
              <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {displayName}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-1 min-h-[1.25rem]">
                {displayDescription}
              </p>

              {/* Rating */}
              <RatingStars
                rating={product.rating}
                size="sm"
                reviewCount={product.reviewCount}
                className="mb-3"
              />

              {/* Price - Enhanced with animation */}
              <div className="transform transition-all duration-300 group-hover:scale-110 ltr:origin-left rtl:origin-right">
                <PriceDisplay
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  discountPercentage={product.discountPercentage}
                  size="lg"
                  className="text-base md:text-lg font-bold"
                />
              </div>

              {/* Color Variants Preview */}
              <div className="flex items-center gap-1 mt-3">
                {product.variants.slice(0, 4).map((variant) => (
                  <div
                    key={variant.color}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 border-background shadow-sm",
                      !variant.inStock && "opacity-40"
                    )}
                    style={{ backgroundColor: variant.colorHex }}
                    title={variant.color}
                  />
                ))}
                {product.variants.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.variants.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </LocaleLink>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}
