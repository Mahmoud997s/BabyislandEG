"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { columns, Order } from "./columns";
import { DataTable } from "../products/data-table";
import {
    Loader2, Search, Filter, LayoutGrid, List,
    XCircle, CheckCircle2, Clock, Truck, Package,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./order-actions";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface OrdersResponse {
    rows: Order[];
    total: number;
    page: number;
    pageSize: number;
}

import { useDebounce } from "@/hooks/use-debounce";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function OrdersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Data state
    const [data, setData] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state initialized from URL
    const statusParam = searchParams.get("status") || "all";
    const paymentStatusParam = searchParams.get("payment_status") || "all";
    const searchParam = searchParams.get("q") || "";
    const pageParam = parseInt(searchParams.get("page") || "1");
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "25");

    const [viewMode, setViewMode] = useState<"list" | "board">("list");
    const [searchQuery, setSearchQuery] = useState(searchParam);

    // Debounced search for API calls
    const debouncedSearch = useDebounce(searchQuery, 400);

    // Sync URL when filters change
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        // Reset to page 1 on filter change (unless page is explicitly updated)
        if (!updates.page) {
            params.set("page", "1");
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
             const params = new URLSearchParams(searchParams);
             // Ensure q is up to date with debounced value if it differs from URL (though typically we sync URL first)
             if (debouncedSearch !== searchParam) {
                 if (debouncedSearch) params.set("q", debouncedSearch);
                 else params.delete("q");
             }

            const response = await fetch(`/api/admin/orders?${params.toString()}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch");
            const result: OrdersResponse = await response.json();
            setData(result.rows);
            setTotal(result.total);
        } catch (err) {
            console.error(err);
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [searchParams, debouncedSearch, searchParam]);

    // Fetch on params change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Sync search input with URL if URL changes externally
    useEffect(() => {
        if (searchParam !== searchQuery && !debouncedSearch) {
             setSearchQuery(searchParam);
        }
    }, [searchParam]);

    // Update URL when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== searchParam) {
            updateUrl({ q: debouncedSearch });
        }
    }, [debouncedSearch, updateUrl, searchParam]);


    const totalPages = Math.ceil(total / pageSizeParam);
    const canPrevious = pageParam > 1;
    const canNext = pageParam < totalPages;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    // ... (Loading Skeleton similar to existing)
    if (loading && data.length === 0) {
          return (
            <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Card className="border shadow-sm">
                        <CardContent className="p-4 space-y-4">
                             {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders Management</h1>
                    <p className="text-slate-500 mt-1">
                        {total.toLocaleString()} orders found
                    </p>
                </div>
                 <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="gap-2"
                    >
                        <List className="w-4 h-4" /> List View
                    </Button>
                    <Button
                        variant={viewMode === "board" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("board")}
                        className="gap-2"
                    >
                        <LayoutGrid className="w-4 h-4" /> Kanban Board
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-4">
                <Tabs 
                    defaultValue="all" 
                    value={statusParam} 
                    onValueChange={(val) => updateUrl({ status: val })} 
                    className="w-full"
                >
                    <TabsList className="bg-white border shadow-sm p-1">
                        <TabsTrigger value="all">All Orders</TabsTrigger>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">Pending</TabsTrigger>
                        <TabsTrigger value="processing" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Processing</TabsTrigger>
                        <TabsTrigger value="shipped" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">Delivered</TabsTrigger>
                         <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Cancelled</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by Order ID, Customer..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                             <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <Select value={paymentStatusParam} onValueChange={(val) => updateUrl({ payment_status: val })}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Payment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payments</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(searchParam || statusParam !== "all" || paymentStatusParam !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.replace(pathname)}
                                        className="text-slate-500 hover:text-red-600"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={fetchOrders}>
                        إعادة المحاولة
                    </Button>
                </div>
            )}

            {/* Content Area */}
            {viewMode === "list" ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="list-view"
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                    {loading && data.length > 0 && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <DataTable columns={columns} data={data} />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            Showing {((pageParam - 1) * pageSizeParam) + 1}-{Math.min(pageParam * pageSizeParam, total)} of {total.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canPrevious}
                                onClick={() => updateUrl({ page: "1" })}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canPrevious}
                                onClick={() => updateUrl({ page: (pageParam - 1).toString() })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-3 py-1 bg-white border rounded-md">
                                Page {pageParam} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canNext}
                                onClick={() => updateUrl({ page: (pageParam + 1).toString() })}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canNext}
                                onClick={() => updateUrl({ page: totalPages.toString() })}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="board-view"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4"
                >
                    {/* Kanban Columns */}
                    {["pending", "processing", "shipped", "delivered"].map((status) => {
                        const items = data.filter(o => o.status === status);
                        const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
                            pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
                            processing: { label: "Processing", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-200" },
                            shipped: { label: "Shipped", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
                            delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
                        };
                        const config = statusConfig[status];
                        const Icon = config.icon;

                        return (
                            <div key={status} className="flex flex-col gap-4 min-w-[300px]">
                                <div className={`flex items-center justify-between p-3 rounded-lg border ${config.color}`}>
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Icon className="w-4 h-4" />
                                        {config.label}
                                    </div>
                                    <Badge variant="secondary" className="bg-white/50 text-slate-700">
                                        {items.length}
                                    </Badge>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {items.map(order => (
                                        <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer group bg-white">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{order.customer_name}</p>
                                                        <p className="text-xs text-slate-500">#{order.id.slice(0, 8)}</p>
                                                    </div>
                                                    <OrderActions order={order} />
                                                </div>
                                                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-50">
                                                    <span className="text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    <span className="font-bold text-slate-900">{formatCurrency(order.total_amount)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="h-32 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                            No orders
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
