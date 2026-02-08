"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReclassifyButton } from "@/components/admin/ReclassifyButton";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, DollarSign, TrendingUp, Database, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    const { t } = useTranslation();
    const [migrating, setMigrating] = useState(false);

    const stats = [
        {
            title: t("admin.stats.totalRevenue"),
            value: "$45,231.89",
            change: `+20.1% ${t("admin.stats.change.lastMonth")}`,
            icon: DollarSign,
        },
        {
            title: t("admin.stats.activeOrders"),
            value: "+573",
            change: `+201 ${t("admin.stats.change.lastHour")}`,
            icon: ShoppingCart,
        },
        {
            title: t("admin.stats.productsInStock"),
            value: "634",
            change: `+12 ${t("admin.stats.change.newProducts")}`,
            icon: Package,
        },
        {
            title: t("admin.stats.activeNow"),
            value: "+573",
            change: `+201 ${t("admin.stats.change.lastHour")}`,
            icon: TrendingUp,
        },
    ];

    const handleMigration = async () => {
        if (!confirm(t("admin.migration.confirmStart"))) return;

        setMigrating(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // 1. Fetch JSON data from public folder
            const response = await fetch("/data/products.json");
            if (!response.ok) throw new Error("Failed to load products.json");
            const jsonData = await response.json();
            console.log(`Loaded ${jsonData.length} products to migrate`);

            // 2. Check if table is empty
            const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });

            if (count && count > 0) {
                if (!confirm(t("admin.migration.dbHasProducts", { count }))) {
                    setMigrating(false);
                    return;
                }
            }

            // 3. Batch insert
            const batchSize = 50;
            for (let i = 0; i < jsonData.length; i += batchSize) {
                const batch = jsonData.slice(i, i + batchSize).map((p: any) => ({
                    name: p.name_en || p.name_ar || p.name || "Unknown Product",
                    name_ar: p.name_ar, // Explicitly save Arabic name if available
                    price: p.price || 0,
                    description: p.description_text || p.description || "",
                    description_ar: p.description_text || p.description_ar, // Map description_text to Arabic description
                    images: p.images || [],
                    category: p.category_ids?.[0] || p.category || "other",
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

            toast.success(t("admin.migration.complete", { success: successCount, fail: failCount }));

        } catch (error: any) {
            console.error(error);
            toast.error(t("admin.migration.failed", { error: error.message }));
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h2>

                {/* Migration Utility - Remove after use */}
                <Button
                    onClick={handleMigration}
                    disabled={migrating}
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                    {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    {migrating ? t("admin.migration.migrating") : t("admin.migration.button")}
                    {migrating ? t("admin.migration.migrating") : t("admin.migration.button")}
                </Button>

                {/* AI Reclassification Button */}
                <div className="ml-4">
                     <ReclassifyButton />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
