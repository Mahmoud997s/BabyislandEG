"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, ShoppingCart, Package, Settings, BarChart3, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminHomePage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0,
        customers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Products Count
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('id', { count: 'exact', head: true });

                // Orders Count
                const { count: ordersCount } = await supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true });

                // Revenue (Sum of total_amount for non-cancelled orders)
                const { data: revenueData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .neq('status', 'cancelled');

                const revenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

                // Customers (Unique phone numbers from orders as a proxy, or hardcode if no users table access)
                // For now, let's just count unique orders as a rough proxy or keep 0 if no customer table
                const { count: customersCount } = await supabase
                    .from('orders')
                    .select('phone', { count: 'exact', head: true }); // Rough proxy

                setStats({
                    products: productsCount || 0,
                    orders: ordersCount || 0,
                    revenue: revenue,
                    customers: customersCount || 0
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (!user || user.role !== "admin") {
        return null; // AdminRoute handles redirect
    }

    const adminModules = [
        { id: "orders", icon: ShoppingCart, label: t("admin.orders"), count: stats.orders, link: "/admin/orders" },
        { id: "products", icon: Package, label: t("admin.products"), count: stats.products, link: "/admin/products" },
        { id: "customers", icon: Users, label: t("admin.customers"), count: stats.customers, disabled: true },
        { id: "analytics", icon: BarChart3, label: t("admin.analytics"), link: "/admin/analytics" },
        { id: "settings", icon: Settings, label: t("admin.settings"), disabled: true },
    ];

    const { i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(isRTL ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP", // Or t("common.currencyCode") if dynamic
        }).format(amount);
    };

    return (
        <Layout>
            <section className="py-8 lg:py-12">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <LayoutDashboard className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">{t("admin.title")}</h1>
                                <p className="text-muted-foreground">{t("admin.welcome")}, {user.name}</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-card rounded-xl p-4 transition-all hover:shadow-md">
                                <p className="text-sm text-muted-foreground mb-1">{t("admin.totalOrders")}</p>
                                <p className="text-2xl font-bold">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.orders}
                                </p>
                            </div>
                            <div className="bg-card rounded-xl p-4 transition-all hover:shadow-md">
                                <p className="text-sm text-muted-foreground mb-1">{t("admin.totalRevenue")}</p>
                                <p className="text-2xl font-bold">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(stats.revenue)}
                                </p>
                            </div>
                            <div className="bg-card rounded-xl p-4 transition-all hover:shadow-md">
                                <p className="text-sm text-muted-foreground mb-1">{t("admin.totalCustomers")}</p>
                                <p className="text-2xl font-bold">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.customers}
                                </p>
                            </div>
                            <div className="bg-card rounded-xl p-4 transition-all hover:shadow-md">
                                <p className="text-sm text-muted-foreground mb-1">{t("admin.totalProducts")}</p>
                                <p className="text-2xl font-bold">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.products}
                                </p>
                            </div>
                        </div>

                        {/* Admin Modules Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {adminModules.map((module) => (
                                <LocaleLink
                                    href={module.link || "#"}
                                    key={module.id}
                                    className={`block ${module.disabled ? 'cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    <div
                                        className={`bg-card rounded-xl p-6 h-full transition-all border border-transparent hover:border-primary/20 ${module.disabled ? 'opacity-50' : 'hover:bg-card/80 hover:shadow-sm'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <module.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{module.label}</h3>
                                                {module.count !== undefined && (
                                                    <p className="text-sm text-muted-foreground">{module.count} {t("admin.items")}</p>
                                                )}
                                                {module.disabled && (
                                                    <p className="text-xs text-muted-foreground">{t("admin.comingSoon")}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </LocaleLink>
                            ))}
                        </div>

                        {/* Back to Account */}
                        <div className="text-center">
                            <Button variant="outline" asChild>
                                <LocaleLink href="/account">{t("admin.backToAccount")}</LocaleLink>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}
