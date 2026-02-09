"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReclassifyButton } from "@/components/admin/ReclassifyButton";
import { Button } from "@/components/ui/button";
import {
    Package, ShoppingCart, DollarSign, TrendingUp, Database,
    Loader2, CheckCircle, AlertTriangle, Clock, Truck, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

// Stats response type
interface StatsResponse {
    orders_today_count: number;
    revenue_today: number;
    pending_count: number;
    shipped_count: number;
    low_stock_count: number | null;
    total_products: number;
    orders_last_7_days: Array<{ date: string; count: number; revenue: number }>;
}

export default function Dashboard() {
    const { t } = useTranslation();
    const [migrating, setMigrating] = useState(false);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch stats from API
    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch("/api/admin/stats", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: StatsResponse = await response.json();
            setStats(data);
        } catch (err: unknown) {
            console.error("Failed to fetch stats:", err);
            setError("فشل في تحميل الإحصائيات");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(val);
    };

    // Migration handler (existing functionality)
    const handleMigration = async () => {
        if (!confirm(t("admin.migration.confirmStart"))) return;

        setMigrating(true);
        let successCount = 0;

        try {
            const response = await fetch("/data/products.json");
            if (!response.ok) throw new Error("Failed to load products.json");
            const jsonData = await response.json();
            console.log(`Loaded ${jsonData.length} products to migrate`);

            const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });

            if (count && count > 0) {
                if (!confirm(t("admin.migration.dbHasProducts", { count }))) {
                    setMigrating(false);
                    return;
                }
            }

            const batchSize = 50;
            for (let i = 0; i < jsonData.length; i += batchSize) {
                const batch = jsonData.slice(i, i + batchSize).map((p: Record<string, unknown>) => ({
                    name: p.name_en || p.name_ar || p.name || "Unknown Product",
                    name_ar: p.name_ar,
                    price: p.price || 0,
                    description: p.description_text || p.description || "",
                    description_ar: p.description_text || p.description_ar,
                    images: p.images || [],
                    category: Array.isArray(p.category_ids) ? p.category_ids[0] : p.category || "other",
                    stock: p.stock_qty || p.stock || 5,
                    isNew: p.isNew || false,
                    isBestSeller: p.isBestSeller || false,
                    isFeatured: p.isFeatured || false,
                    tagline_ar: p.tagline_ar,
                    rating: p.rating || 4.5,
                    reviews: p.reviews || 0
                }));

                const { migrateProducts } = await import("@/actions/products");
                await migrateProducts(batch);
                successCount += batch.length;
            }

            toast.success(t("admin.migration.complete", { success: successCount, fail: 0 }));
            fetchStats(); // Refresh stats

        } catch (error: unknown) {
            console.error(error);
            toast.error(t("admin.migration.failed", { error: error instanceof Error ? error.message : "Unknown" }));
        } finally {
            setMigrating(false);
        }
    };

    // KPI Cards configuration
    const kpiCards = stats ? [
        {
            title: "إيرادات اليوم",
            value: formatCurrency(stats.revenue_today),
            subtitle: `${stats.orders_today_count} طلب اليوم`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "طلبات معلقة",
            value: stats.pending_count.toString(),
            subtitle: "تحتاج معالجة",
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "طلبات تم شحنها",
            value: stats.shipped_count.toString(),
            subtitle: "في الطريق",
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "منتجات Low Stock",
            value: stats.low_stock_count?.toString() ?? "N/A",
            subtitle: `من ${stats.total_products} منتج`,
            icon: stats.low_stock_count && stats.low_stock_count > 0 ? AlertTriangle : Package,
            color: stats.low_stock_count && stats.low_stock_count > 0 ? "text-red-600" : "text-slate-600",
            bgColor: stats.low_stock_count && stats.low_stock_count > 0 ? "bg-red-50" : "bg-slate-50",
        },
    ] : [];

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h2>

                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchStats}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>

                    {/* Migration Button */}
                    <Button
                        onClick={handleMigration}
                        disabled={migrating}
                        variant="outline"
                        className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                        {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {migrating ? t("admin.migration.migrating") : t("admin.migration.button")}
                    </Button>

                    {/* AI Reclassification Button */}
                    <ReclassifyButton />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={fetchStats}>
                        إعادة المحاولة
                    </Button>
                </div>
            )}

            {/* KPI Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((kpi) => (
                        <Card key={kpi.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {kpi.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {kpi.subtitle}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Last 7 Days Chart (Simple Table) */}
            {stats && stats.orders_last_7_days.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            الطلبات آخر 7 أيام
                        </CardTitle>
                        <CardDescription>
                            ملخص الطلبات والإيرادات اليومية
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50">
                                        <th className="text-right py-2 px-3 font-medium">التاريخ</th>
                                        <th className="text-center py-2 px-3 font-medium">الطلبات</th>
                                        <th className="text-left py-2 px-3 font-medium">الإيرادات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.orders_last_7_days.map((day) => (
                                        <tr key={day.date} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-2 px-3 text-slate-600">
                                                {new Date(day.date).toLocaleDateString("ar-EG", { weekday: "short", month: "short", day: "numeric" })}
                                            </td>
                                            <td className="py-2 px-3 text-center font-medium">{day.count}</td>
                                            <td className="py-2 px-3 text-left font-bold text-green-600">
                                                {formatCurrency(day.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 font-bold">
                                        <td className="py-2 px-3">المجموع</td>
                                        <td className="py-2 px-3 text-center">
                                            {stats.orders_last_7_days.reduce((sum, d) => sum + d.count, 0)}
                                        </td>
                                        <td className="py-2 px-3 text-left text-green-600">
                                            {formatCurrency(stats.orders_last_7_days.reduce((sum, d) => sum + d.revenue, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.systemStatus.title")}</CardTitle>
                    <CardDescription>{t("admin.systemStatus.desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("admin.systemStatus.connected")}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
