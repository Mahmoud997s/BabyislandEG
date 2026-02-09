import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Package, Clock, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";

interface ActionQueueProps {
    stats: {
        pending_count: number;
        processing_count?: number; // Added
        needs_review_count?: number;
        pending_reviews_count?: number;
        low_stock_count?: number | null;
    } | null;
}

export function ActionQueue({ stats }: ActionQueueProps) {
    if (!stats) return null;

    const actions = [
        {
            id: "pending_orders",
            title: "Pending Orders",
            count: stats.pending_count,
            icon: Clock,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            href: "/admin/orders?status=pending",
            label: "Review"
        },
        {
            id: "processing_orders",
            title: "Processing Orders",
            // We need processing count. Stats API doesn't currently return it explicitly, but let's assume it might or use a placeholder/0 if missing.
            // Wait, the user said "Use existing API". If stats API doesn't have it, I might need to add it or just show 0?
            // "Use existing API routes (app/api/admin/orders, products, stats). Do not create new API unless absolutely required."
            // I'll add processing_count to the stats API quickly, it's safer.
            // For now, let's use a placeholder or assume stats has it.
            // Actually, I can update the stats API to include 'processing_count' as well.
            count: stats.processing_count || 0, 
            icon: Truck,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            href: "/admin/orders?status=processing",
            label: "Update"
        },
        {
            id: "low_stock",
            title: "Low Stock Products",
            count: stats.low_stock_count || 0,
            icon: AlertCircle,
            color: "text-red-600 bg-red-50 border-red-100",
            href: "/admin/products?stock=low",
            label: "Restock"
        },
        {
            id: "missing_data",
            title: "Missing Data",
            count: stats.needs_review_count || 0,
            icon: Package,
            color: "text-orange-600 bg-orange-50 border-orange-100",
            href: "/admin/products?missing=1",
            label: "Fix"
        }
    ];

    return (
        <Card className="col-span-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Action Queue
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {actions.map((action) => (
                        <div key={action.id} className={`flex flex-col justify-between p-4 rounded-xl border transition-all hover:shadow-md bg-white group ${action.color}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm">
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{action.count}</span>
                            </div>
                            <div>
                                <p className="font-medium text-slate-700 mb-3">{action.title}</p>
                                <LocaleLink href={action.href} className="block">
                                    <Button size="sm" variant="ghost" className="w-full justify-between bg-white/50 hover:bg-white text-slate-700 hover:text-primary h-8 text-xs">
                                        {action.label} 
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </LocaleLink>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
