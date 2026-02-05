import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Star, Share2, Heart, Award, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const addItem = useCartStore((state) => state.addItem);
    const isRtl = i18n.language === "ar";

    // Async state
    const [product, setProduct] = useState<Product | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            productsService.getProductById(id).then((p) => {
                setProduct(p);
                setLoading(false);
            });
        }
    }, [id]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    if (loading) {
        return (
            <Layout>
                <div className="container-main py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        // Ideally redirect to 404
        return (
            <Layout>
                <div className="container-main py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">{isRtl ? "المنتج غير موجود" : "Product Not Found"}</h1>
                    <Button asChild><Link to="/shop">Back to Shop</Link></Button>
                </div>
            </Layout>
        );
    }

    const currentVariant = product.variants[selectedVariantIndex];
    // Gather all images from current variant, or fallback to main product flow if implemented differently.
    // Using current variant images as per data structure.
    const images = currentVariant.images?.length ? currentVariant.images : ["/placeholder.svg"];

    const handleAddToCart = () => {
        if (currentVariant.inStock) {
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

    return (
        <Layout>
            {/* Breadcrumb / Back */}
            <div className="bg-muted/30 border-b">
                <div className="container-main py-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link to="/shop">
                            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {t("nav.shop")}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container-main py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Gallery Section */}
                    {/* Gallery Section */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border">
                            <motion.img
                                key={images[selectedImageIndex]}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={images[selectedImageIndex]}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={cn(
                                            "w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                                            selectedImageIndex === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div>
                        {product.brand && (
                            <span className="text-muted-foreground font-medium mb-2 block text-sm">
                                {product.brand}
                            </span>
                        )}

                        <h1 className="text-2xl lg:text-3xl font-bold mb-4">{displayName}</h1>

                        {/* Rating & Stock */}
                        <div className="flex items-center gap-4 mb-6">
                            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                            {product.stockStatus === 'in-stock' ? (
                                <span className="text-green-600 font-medium text-sm px-2 py-1 bg-green-100 rounded-full">
                                    {t("common.inStock")}
                                </span>
                            ) : (
                                <Badge variant="outOfStock">{t("common.outOfStock")}</Badge>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-8">
                            <PriceDisplay
                                price={product.price}
                                compareAtPrice={product.compareAtPrice}
                                discountPercentage={product.discountPercentage}
                                size="lg"
                            />
                        </div>

                        {/* Tagline */}
                        {displayTagline && (
                            <p className="text-base text-muted-foreground mb-6 italic">
                                {displayTagline}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="space-y-6 pt-6 border-t">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg h-12">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-bold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted"
                                    >
                                        +
                                    </button>
                                </div>
                                <Button
                                    size="lg"
                                    className="flex-1 h-12 text-lg gap-2 bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 text-white border-0"
                                    onClick={handleAddToCart}
                                    disabled={product.stockStatus === 'out-of-stock'}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {t("common.addToCart")}
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                                    <Heart className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-12 space-y-6">
                            <div className={cn(
                                "prose max-w-none text-muted-foreground relative transition-all duration-300",
                                !isDescriptionExpanded && "line-clamp-2 overflow-hidden"
                            )}>
                                {displayDescription.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 min-h-[1.5em]">{line}</p>
                                ))}
                            </div>

                            <Button
                                variant="link"
                                className="p-0 h-auto font-semibold text-primary"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? t("common.showLess", "عرض أقل") : t("common.showMore", "عرض المزيد")}
                            </Button>
                        </div>

                        {/* Details Accordion */}
                        <div className="mt-8">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="details">
                                    <AccordionTrigger>{t("product.details", "تفاصيل المنتج")}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="prose max-w-none text-muted-foreground text-sm">
                                            {displayDescription.split('\n').map((line, i) => (
                                                <p key={i} className="mb-2">{line}</p>
                                            ))}
                                            {product.features && product.features.length > 0 && (
                                                <ul className="list-disc ps-5 mt-4 space-y-1">
                                                    {product.features.map((feature, idx) => (
                                                        <li key={idx}>{feature}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="shipping">
                                    <AccordionTrigger>{t("product.shippingReturns", "الشحن والإرجاع")}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="text-sm text-muted-foreground space-y-2">
                                            <p>
                                                {t("product.shippingInfo", "شحن سريع لجميع المحافظات خلال 3-5 أيام عمل.")}
                                            </p>
                                            <p>
                                                {t("product.returnsInfo", "إرجاع سهل خلال 14 يوم مع ضمان استرداد الأموال.")}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <Link to="/shipping" className="text-primary hover:underline">
                                                    {t("nav.shipping", "سياسة الشحن")}
                                                </Link>
                                                <Link to="/returns" className="text-primary hover:underline">
                                                    {t("nav.returns", "سياسة الإرجاع")}
                                                </Link>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="warranty">
                                    <AccordionTrigger>{t("product.warranty", "الضمان")}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground">
                                            {t("product.warrantyInfo", "ضمان شامل لمدة عام ضد عيوب الصناعة.")}
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
