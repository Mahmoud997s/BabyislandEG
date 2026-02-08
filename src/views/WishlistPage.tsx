"use client";

import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { wishlistService, WishlistItem } from "@/services/wishlistService";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";

export default function WishlistPage() {
    const { user } = useAuthStore();
    const { addItem } = useCartStore();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadWishlist = async () => {
        if (!user) return;

        setLoading(true);
        const data = await wishlistService.getWishlist(user.id);
        setWishlist(data);
        setLoading(false);
    };

    const handleRemove = async (productId: string) => {
        if (!user) return;

        const success = await wishlistService.removeFromWishlist(user.id, productId);
        if (success) {
            toast.success("تم الإزالة من المفضلة");
            loadWishlist();
        } else {
            toast.error("فشل في الإزالة");
        }
    };

    const handleAddToCart = (item: WishlistItem) => {
        if (!item.product) return;

        const defaultVariant = item.product.variants?.find((v) => v.inStock) || item.product.variants?.[0];

        if (defaultVariant) {
            addItem(item.product, defaultVariant, 1);
            toast.success("تم الإضافة إلى السلة");
        } else {
            toast.error("المنتج غير متوفر");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(amount);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50" dir="rtl">
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                    <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">قائمة المفضلة</h1>
                    <p className="text-slate-500 mb-6">يجب تسجيل الدخول لعرض قائمة المفضلة</p>
                    <Button asChild>
                        <LocaleLink href="/login">تسجيل الدخول</LocaleLink>
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                        قائمة المفضلة
                    </h1>
                    <p className="text-slate-500 mt-1">{wishlist.length} منتج في قائمتك</p>
                </motion.div>

                {/* Wishlist Grid */}
                {wishlist.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">قائمة المفضلة فارغة</h2>
                            <p className="text-slate-500 mb-6">لم تضف أي منتجات إلى المفضلة بعد</p>
                            <Button asChild>
                                <LocaleLink href="/shop">تصفح المنتجات</LocaleLink>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item, index) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group hover:shadow-xl transition-shadow border-0 shadow-lg overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={product.images?.[0] || "/placeholder.png"}
                                                alt={product.name}
                                                className="w-full h-56 object-cover"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 left-2"
                                                onClick={() => handleRemove(product.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <CardContent className="p-4">
                                            <LocaleLink href={`/product/${product.id}`}>
                                                <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </LocaleLink>
                                            <p className="text-2xl font-bold text-primary mb-4">
                                                {formatCurrency(product.price)}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 gap-2"
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    أضف للسلة
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="flex-1"
                                                >
                                                    <LocaleLink href={`/product/${product.id}`}>عرض</LocaleLink>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
