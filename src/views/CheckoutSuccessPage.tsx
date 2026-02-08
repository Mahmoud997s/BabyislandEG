"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, ArrowLeft, Package, Truck, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const { lastOrder } = useCartStore();

    const formatCurrency = (amount: number) => {
        return `${(amount || 0).toLocaleString(isRTL ? "ar-EG" : "en-EG")} ${t("common.currency")}`;
    };

    // Handle case where there's no order data
    if (!lastOrder) {
        return (
            <Layout>
                <section className="py-16">
                    <div className="container-main text-center">
                        <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">لا توجد بيانات طلب</h1>
                        <p className="text-muted-foreground mb-8">
                            يبدو أنك وصلت لهذه الصفحة بشكل مباشر. يرجى إتمام طلب جديد.
                        </p>
                        <Button asChild>
                            <LocaleLink href="/shop">تصفح المنتجات</LocaleLink>
                        </Button>
                    </div>
                </section>
            </Layout>
        );
    }

    // Extract data with fallbacks for both database (snake_case) and legacy formats
    const orderId = lastOrder.id || lastOrder.orderId || "N/A";
    const customerName = lastOrder.customer_name || lastOrder.checkoutData?.name || "عميل";
    const phone = lastOrder.phone || lastOrder.checkoutData?.phone || "";
    const city = lastOrder.city || lastOrder.checkoutData?.city || "";
    const address = lastOrder.shipping_address || lastOrder.checkoutData?.address || "";
    const total = lastOrder.total_amount || lastOrder.total || 0;
    const items = lastOrder.items || [];

    return (
        <Layout>
            <section className="py-12 lg:py-20">
                <div className="container-main max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        {/* Success Icon */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-green-600">
                            🎉 تم الطلب بنجاح!
                        </h1>
                        <p className="text-muted-foreground mb-8 text-lg">
                            شكراً لك {customerName}! سنتواصل معك قريباً.
                        </p>

                        {/* Order Number - Prominent */}
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 mb-8 border-2 border-dashed border-primary/30">
                            <p className="text-sm text-muted-foreground mb-2">رقم الطلب الخاص بك</p>
                            <p className="text-2xl font-bold font-mono text-primary tracking-wider">{orderId}</p>
                            <p className="text-xs text-muted-foreground mt-2">احتفظ بهذا الرقم لمتابعة طلبك</p>
                        </div>

                        {/* Delivery Estimate */}
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 mb-8 flex items-center justify-center gap-3">
                            <Truck className="w-6 h-6 text-orange-500" />
                            <div className="text-right">
                                <p className="font-semibold text-orange-700 dark:text-orange-400">التوصيل المتوقع</p>
                                <p className="text-sm text-orange-600 dark:text-orange-300">خلال 2-5 أيام عمل</p>
                            </div>
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>

                        {/* Order Summary */}
                        {items.length > 0 && (
                            <div className="bg-card rounded-xl p-6 mb-8 text-right shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    ملخص الطلب
                                </h2>
                                <div className="space-y-3 mb-4">
                                    {items.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm py-2 border-b border-dashed last:border-0"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.product?.name || "منتج"} × {item.quantity || 1}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 pt-4">
                                    <div className="flex items-center justify-between font-bold text-lg">
                                        <span>الإجمالي</span>
                                        <span className="text-primary text-xl">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Info */}
                        <div className="bg-card rounded-xl p-6 mb-8 text-right shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">📍 عنوان التوصيل</h2>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">الاسم: </span>{customerName}</p>
                                <p><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{phone}</span></p>
                                <p><span className="text-muted-foreground">المدينة: </span>{city}</p>
                                <p><span className="text-muted-foreground">العنوان: </span>{address}</p>
                            </div>
                        </div>

                        {/* Payment Note */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-8 text-sm text-blue-700 dark:text-blue-300">
                            💳 الدفع عند الاستلام - سيتصل بك مندوب التوصيل قبل الوصول
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="gap-2">
                                <LocaleLink href="/shop">
                                    <ShoppingBag className="w-5 h-5" />
                                    تسوق المزيد
                                </LocaleLink>
                            </Button>
                            <Button variant="outline" size="lg" asChild className="gap-2">
                                <LocaleLink href="/">
                                    <ArrowLeft className="w-5 h-5" />
                                    العودة للرئيسية
                                </LocaleLink>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

