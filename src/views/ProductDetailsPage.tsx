"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Heart, ArrowRight, ArrowLeft, Check, Minus, Plus, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { PriceDisplay } from "@/components/ui/price-display";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts } from "@/components/RelatedProducts";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const addItem = useCartStore((state) => state.addItem);
    const isRtl = i18n.language === "ar";
    const dir = isRtl ? "rtl" : "ltr";

    // Async state
    const [product, setProduct] = useState<Product | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            productsService.getProductById(id as string).then((p) => {
                setProduct(p);
                setLoading(false);
            });
        }
    }, [id]);

    // Analytics: Track View
    useEffect(() => {
        if (product && product.id) {
            fetch('/api/analytics/view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id })
            }).catch(err => console.error('[Analytics] Failed to track view:', err));
        }
    }, [product]);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Mock sizes for skeleton requirement (Data model doesn't strictly support sizes yet)
    const MOCK_SIZES = ["Small", "Medium", "Large", "X-Large"];

    if (loading) {
        return (
            <Layout>
                <div className="container-main py-20 flex justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <div className="container-main py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">{isRtl ? "المنتج غير موجود" : "Product Not Found"}</h1>
                    <Button asChild><LocaleLink href="/shop">{t("nav.shop")}</LocaleLink></Button>
                </div>
            </Layout>
        );
    }

    const currentVariant = product.variants[selectedVariantIndex];
    // Gather all images: prefer variant images, fallback to product images, then placeholder
    const images = (currentVariant.images?.length ? currentVariant.images : product.images) || ["/placeholder.svg"];

    const handleAddToCart = () => {
        if (currentVariant.inStock) {
            // Ideally pass size here if supported
            addItem(product, currentVariant, quantity);
            toast({
                title: t("cart.added"),
                description: `${product.name} x${quantity}`,
            });
        }
    };

    const displayName = (isRtl && product.name_ar) ? product.name_ar : product.name;
    const displayDescription = (isRtl && product.description_ar) ? product.description_ar : product.description;
    const displayTagline = (isRtl && product.tagline_ar) ? product.tagline_ar : product.tagline;
    const hasVariants = product.variants.length > 1;

    return (
        <Layout>
            <div className="container-main py-6 lg:py-10 space-y-8">
                {/* A) Page Wrapper & B) Breadcrumb */}
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <LocaleLink href="/">{t("nav.home")}</LocaleLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <LocaleLink href="/shop">{t("nav.shop")}</LocaleLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{displayName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* C) Main Section (Desktop = 2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT: Product Gallery (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4">
                         {/* Thumbnails Rail */}
                         <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={cn(
                                        "relative w-20 h-20 lg:w-full lg:aspect-square rounded-md overflow-hidden border-2 transition-all shrink-0",
                                        selectedImageIndex === idx 
                                            ? "border-primary ring-1 ring-primary" 
                                            : "border-transparent hover:border-muted-foreground/30"
                                    )}
                                >
                                    <Image 
                                        src={img} 
                                        alt={`Thumbnail ${idx}`} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </button>
                            ))}
                         </div>

                         {/* Main Image */}
                         <div className="relative flex-1 aspect-[4/5] lg:aspect-auto bg-muted/20 rounded-xl overflow-hidden border border-border">
                            <Image
                                src={images[selectedImageIndex] || images[0]}
                                alt={displayName}
                                fill
                                className="object-contain p-4"
                                priority
                            />
                            {/* Tags/Badges could go here */}
                             {product.discountPercentage && product.discountPercentage > 0 && (
                                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                                    -{product.discountPercentage}%
                                </Badge>
                            )}
                         </div>
                    </div>

                    {/* RIGHT: Product Info (5 cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-fredoka mb-4">
                                {displayName}
                            </h1>
                            
                            {/* Rating Row */}
                            <div className="flex items-center gap-4 text-sm">
                                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                                <span className="text-muted-foreground">
                                    {product.rating.toFixed(1)}/5 ({product.reviewCount} {t("product.reviews", "Reviews")})
                                </span>
                            </div>
                        </div>

                        {/* Price Row */}
                        <div className="flex items-baseline gap-4">
                             <PriceDisplay
                                price={product.price}
                                compareAtPrice={product.compareAtPrice}
                                discountPercentage={product.discountPercentage}
                                size="3xl"
                                className="font-bold text-foreground"
                            />
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                             {displayTagline || displayDescription.split('.')[0] + '.'}
                        </p>

                        <Separator />

                        {/* Select Color */}
                        {hasVariants && (
                            <div className="space-y-3">
                                <span className="text-sm font-semibold text-foreground">{t("product.selectColor", "Select Colors")}</span>
                                <div className="flex items-center gap-3">
                                     {product.variants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                            className={cn(
                                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative",
                                                selectedVariantIndex === idx 
                                                    ? "border-foreground ring-1 ring-foreground" 
                                                    : "border-transparent hover:scale-110"
                                            )}
                                            style={{ backgroundColor: variant.colorHex }}
                                            title={variant.name || variant.color}
                                        >
                                             {selectedVariantIndex === idx && (
                                                <Check className={cn(
                                                    "w-4 h-4", 
                                                    ["#ffffff", "#fff", "white"].includes(variant.colorHex.toLowerCase()) ? "text-black" : "text-white"
                                                )} />
                                            )}
                                        </button>
                                     ))}
                                </div>
                            </div>
                        )}

                        {/* Choose Size (Visual Only / Mock) */}
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-foreground">{t("product.chooseSize", "Choose Size")}</span>
                            <div className="flex flex-wrap gap-2">
                                {MOCK_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-sm font-medium transition-colors border",
                                            selectedSize === size
                                                ? "bg-foreground text-background border-foreground"
                                                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                        )}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Quantity + CTA */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                             <div className="flex items-center bg-muted/50 rounded-full px-4 h-12 w-fit border border-input">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-foreground">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <Button
                                size="lg"
                                className="flex-1 h-12 rounded-full text-lg font-bold shadow-soft"
                                onClick={handleAddToCart}
                                disabled={product.stockStatus === 'out-of-stock'}
                            >
                                {product.stockStatus === 'out-of-stock' ? t("common.outOfStock") : t("common.addToCart")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* D) Tabs Section */}
                <div className="mt-16 lg:mt-24">
                     <Tabs defaultValue="reviews" className="w-full" dir={dir}>
                        <div className="border-b border-border mb-8">
                             <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-8">
                                <TabsTrigger 
                                    value="details" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none px-0 pb-3 text-lg font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
                                >
                                    {t("product.details", "Product Details")}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="reviews" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none px-0 pb-3 text-lg font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
                                >
                                    {t("product.reviews", "Rating & Reviews")}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="faqs" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none px-0 pb-3 text-lg font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
                                >
                                    {t("nav.faq", "FAQs")}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Details Content */}
                        <TabsContent value="details" className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                             <div className="prose max-w-none text-muted-foreground">
                                <h3 className="text-xl font-bold text-foreground mb-4">{t("product.description", "Description")}</h3>
                                {displayDescription.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4 leading-relaxed">{line}</p>
                                ))}
                                
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                     {product.specs && (
                                        <div className="bg-muted/30 p-6 rounded-lg border">
                                            <h4 className="font-bold text-foreground mb-4">{t("product.specs", "Specifications")}</h4>
                                            <ul className="space-y-3">
                                                {Object.entries(product.specs).map(([key, value]) => (
                                                    <li key={key} className="flex justify-between border-b border-border pb-2 last:border-0">
                                                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                                        <span className="font-medium text-foreground">{value?.toString()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                     )}
                                </div>
                             </div>
                        </TabsContent>

                        {/* E) Reviews Section (Using Grid Layout as requested) */}
                        <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2">
                             <ProductReviews productId={parseInt(product.id)} />
                        </TabsContent>

                        {/* FAQs Content */}
                        <TabsContent value="faqs" className="animate-in fade-in slide-in-from-bottom-2">
                             <div className="space-y-4 max-w-3xl">
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-foreground mb-2">{t("product.shippingReturns", "Shipping & Returns")}</h4>
                                    <p className="text-muted-foreground">{t("product.shippingInfo", "Info regarding shipping...")}</p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-foreground mb-2">{t("product.warranty", "Warranty")}</h4>
                                    <p className="text-muted-foreground">{t("product.warrantyInfo", "Info regarding warranty...")}</p>
                                </div>
                             </div>
                        </TabsContent>
                     </Tabs>
                </div>

                {/* F) Related Products */}
                <div className="mt-24 border-t border-border pt-16">
                     <div className="text-center mb-8">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-foreground tracking-tighter uppercase">
                            {t("product.youMightAlsoLike", "YOU MIGHT ALSO LIKE")}
                        </h2>
                    </div>
                    <RelatedProducts currentProductId={product.id} category={product.category} limit={4} />
                </div>
            </div>
        </Layout>
    );
}
