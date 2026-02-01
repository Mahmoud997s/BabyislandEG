import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { PriceDisplay } from "@/components/ui/price-display";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const defaultVariant = product.variants.find((v) => v.inStock) || product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant.inStock) {
      addItem(product, defaultVariant);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("group relative", className)}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="card-hover rounded-2xl bg-card overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-product bg-secondary overflow-hidden">
            <img
              src={defaultVariant.images[0]}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                variant="secondary"
                className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
                onClick={handleAddToCart}
                disabled={product.stockStatus === "out-of-stock"}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Brand */}
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>

            {/* Name */}
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {product.tagline}
            </p>

            {/* Rating */}
            <RatingStars
              rating={product.rating}
              size="sm"
              reviewCount={product.reviewCount}
              className="mb-3"
            />

            {/* Price */}
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              discountPercentage={product.discountPercentage}
              size="sm"
            />

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
      </Link>
    </motion.div>
  );
}
