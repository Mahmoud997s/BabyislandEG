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

// Types
interface OrdersResponse {
    rows: Order[];
    total: number;
    page: number;
    pageSize: number;
}

import { useDebounce } from "@/hooks/use-debounce";

export default function OrdersPage() {
    // Data state
    const [data, setData] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "board">("list");

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Sorting state
    const [sortField, setSortField] = useState<"created_at" | "total_amount">("created_at");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // Debounced search
    const debouncedSearch = useDebounce(searchQuery, 400);

    // Abort controller ref
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sort: sortField,
                dir: sortDir,
            });

            if (statusFilter !== "all") params.set("status", statusFilter);
            if (paymentStatusFilter !== "all") params.set("payment_status", paymentStatusFilter);
            if (debouncedSearch) params.set("q", debouncedSearch);

            const response = await fetch(`/api/admin/orders?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result: OrdersResponse = await response.json();
            setData(result.rows);
            setTotal(result.total);
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") {
                return; // Ignore abort errors
            }
            console.error("Failed to fetch orders:", err);
            setError("فشل في تحميل الطلبات. حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, statusFilter, paymentStatusFilter, debouncedSearch, sortField, sortDir]);

    // Effect to fetch orders
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, paymentStatusFilter, debouncedSearch]);

    // Pagination helpers
    const totalPages = Math.ceil(total / pageSize);
    const canPrevious = page > 1;
    const canNext = page < totalPages;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    // Loading skeleton
    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-96" />
                            <Skeleton className="h-10 w-44" />
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders Management</h1>
                    <p className="text-slate-500 mt-1">
                        {total.toLocaleString()} orders total
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

            {/* Toolbar */}
            <Card className="border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Order ID, Customer, Phone, Email..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Status:</span>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Payment Status Filter */}
                            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
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

                            {/* Page Size */}
                            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(parseInt(v))}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {(searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setPaymentStatusFilter("all");
                                    }}
                                >
                                    <XCircle className="w-4 h-4 text-slate-500" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                            Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} of {total.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canPrevious}
                                onClick={() => setPage(1)}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canPrevious}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-3 py-1 bg-white border rounded-md">
                                Page {page} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canNext}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!canNext}
                                onClick={() => setPage(totalPages)}
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
