"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { motion } from "framer-motion";
import { User, Mail, Phone, ShoppingBag, LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";

import { useEffect, useState } from "react";
import { orderService, Order } from "@/services/orderService";

function OrdersList({ userId }: { userId: string }) {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getUserOrders(userId);
                setOrders(data || []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

    const isRTL = i18n.language === "ar";
    
    if (loading) {
        return <div className="text-center py-4 text-muted-foreground">{t("common.loading", "Loading...")}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("account.noOrders")}</p>
                <Button variant="outline" className="mt-4" asChild>
                    <LocaleLink href="/shop">{t("account.startShopping")}</LocaleLink>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <div>
                            <p className="font-semibold text-sm">#{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-EG')}
                            </p>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase">
                            {t(`account.status.${order.status}`)}
                        </div>
                    </div>

                    <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {item.quantity}x {isRTL && item.product.name_ar ? item.product.name_ar : item.product.name}
                                </span>
                                <span>
                                    {(item.product.price * item.quantity).toLocaleString(isRTL ? "ar-EG" : "en-EG")} {t("common.currency")}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t text-sm font-semibold">
                        <span>{t("account.totalOrder")}</span>
                        <span>{order.total_amount.toLocaleString(isRTL ? "ar-EG" : "en-EG")} {t("common.currency")}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AccountPage() {
    const { t } = useTranslation();
    const navigate = useLocaleNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (!user) {
        return null; // ProtectedRoute handles redirect
    }

    return (
        <Layout>
            <section className="py-8 lg:py-12">
                <div className="container-main max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{t("account.title")}</h1>
                                    <p className="text-muted-foreground text-sm">{t("account.welcome")}, {user.name}</p>
                                </div>
                            </div>
                            {user.role === "admin" && (
                                <Button variant="outline" size="sm" asChild>
                                    <LocaleLink href="/admin">
                                        <Settings className="w-4 h-4 ml-2" />
                                        {t("account.adminPanel")}
                                    </LocaleLink>
                                </Button>
                            )}
                        </div>

                        {/* Profile Card */}
                        <div className="bg-card rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">{t("account.profileInfo")}</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.name")}</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.email")}</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.phone")}</p>
                                        <p className="font-medium">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="bg-card rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">{t("account.orders")}</h2>
                            </div>

                            <OrdersList userId={user.id} />
                        </div>


                        {/* Logout Button */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            size="lg"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 ml-2" />
                            {t("account.logout")}
                        </Button>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}
