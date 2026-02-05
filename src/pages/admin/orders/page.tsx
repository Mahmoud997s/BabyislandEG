import { useEffect, useState } from "react";
import { columns, Order } from "./columns";
import { DataTable } from "../products/data-table"; // Reusing the generic DataTable
import { supabase } from "@/lib/supabase";
import {
    Loader2, Search, Filter, LayoutGrid, List, SlidersHorizontal,
    MoreHorizontal, CheckCircle2, Clock, XCircle, Truck, Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./order-actions";
import { motion } from "framer-motion";

export default function OrdersPage() {
    const [data, setData] = useState<Order[]>([]);
    const [filteredData, setFilteredData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "board">("list");

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [data, searchQuery, statusFilter]);

    async function loadOrders() {
        setLoading(true);
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(orders as Order[]);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }

    function filterOrders() {
        let result = [...data];

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(order =>
                order.customer_name?.toLowerCase().includes(lowerQuery) ||
                order.id.toLowerCase().includes(lowerQuery) ||
                order.phone?.toLowerCase().includes(lowerQuery)
            );
        }

        // Status Filter
        if (statusFilter !== "all") {
            result = result.filter(order => order.status === statusFilter);
        }

        setFilteredData(result);
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading Orders...</p>
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
                        Track and manage all customer orders in one place.
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
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Order ID, Customer, or Phone..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Status:</span>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Orders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Orders</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Clear Filters Button */}
                            {(searchQuery || statusFilter !== "all") && (
                                <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                                    <XCircle className="w-4 h-4 text-slate-500" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Area */}
            {viewMode === "list" ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="list-view"
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                    <DataTable columns={columns} data={filteredData} />
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
                        const items = filteredData.filter(o => o.status === status);
                        const statusConfig: Record<string, any> = {
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
