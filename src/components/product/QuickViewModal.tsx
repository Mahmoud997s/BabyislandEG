import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

import { useTranslation } from "react-i18next";

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    if (!product) return null;

    const displayName = (isRtl && product.name_ar) ? product.name_ar : product.name;
    const displayDescription = (isRtl && product.description_ar) ? product.description_ar : product.description;

    const activeVariantFragment = selectedVariant
        ? product.variants.find(v => v.color === selectedVariant)
        : product.variants.find(v => v.inStock) || product.variants[0];

    const handleAddToCart = () => {
        if (activeVariantFragment) {
            addItem(product, activeVariantFragment);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="grid md:grid-cols-2 h-full">
                    {/* Image Side */}
                    <div className="bg-gray-50/50 p-8 flex items-center justify-center relative">
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                            {product.discountPercentage && (
                                <Badge variant="sale">-{product.discountPercentage}%</Badge>
                            )}
                            {product.isBestSeller && <Badge variant="bestSeller">Best Seller</Badge>}
                        </div>
                        <img
                            src={activeVariantFragment?.images[0]}
                            alt={displayName}
                            className="w-full h-auto object-contain max-h-[300px] mix-blend-multiply transition-all duration-500 hover:scale-110"
                        />
                    </div>

                    {/* Content Side */}
                    <div className="p-8 flex flex-col justify-center">
                        <div className="mb-1 text-sm text-[#0EA5E9] font-bold tracking-wider uppercase">
                            {product.brand}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-foreground font-display">{displayName}</h2>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("w-4 h-4", i < Math.floor(product.rating) ? "fill-current" : "text-gray-200")} />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                        </div>

                        <div className="relative">
                            <p className={cn(
                                "text-muted-foreground mb-2 text-sm leading-relaxed text-pretty transition-all duration-200",
                                !isExpanded && "line-clamp-2"
                            )}>
                                {displayDescription}
                            </p>
                            {product.description.length > 100 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-primary text-xs font-semibold hover:underline mb-6 block"
                                >
                                    {isExpanded ? "عرض أقل" : "عرض المزيد"}
                                </button>
                            )}
                        </div>

                        <div className="mb-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Color:</span>
                                <div className="flex gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.color}
                                            onClick={() => setSelectedVariant(v.color)}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 transition-all duration-200",
                                                selectedVariant === v.color || (!selectedVariant && activeVariantFragment?.color === v.color)
                                                    ? "border-primary scale-110 shadow-sm"
                                                    : "border-transparent hover:scale-110"
                                            )}
                                            style={{ backgroundColor: v.colorHex }}
                                            title={v.color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex items-center justify-between">
                                <PriceDisplay
                                    price={product.price}
                                    compareAtPrice={product.compareAtPrice}
                                    size="xl"
                                />
                            </div>

                            <Button
                                className="w-full h-12 rounded-xl font-bold text-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform active:scale-95"
                                disabled={!activeVariantFragment?.inStock}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {activeVariantFragment?.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
