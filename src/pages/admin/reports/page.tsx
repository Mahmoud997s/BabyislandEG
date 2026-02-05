import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Loader2, Download, TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import { motion } from "framer-motion";

interface SalesReport {
    period: string;
    orders: number;
    revenue: number;
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [salesData, setSalesData] = useState<SalesReport[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        topCustomersCount: 0
    });

    useEffect(() => {
        loadReports();
    }, [reportType]);

    const loadReports = async () => {
        setLoading(true);

        // Fetch all orders
        const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, items, created_at, status')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

        if (!orders) {
            setLoading(false);
            return;
        }

        // Calculate summary
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setSummary({
            totalRevenue,
            totalOrders,
            avgOrderValue,
            topCustomersCount: 0
        });

        // Aggregate sales by period
        const salesMap = new Map<string, { orders: number; revenue: number }>();
        const productMap = new Map<string, { quantity: number; revenue: number }>();

        orders.forEach(order => {
            const date = new Date(order.created_at);
            let key: string;

            if (reportType === "daily") {
                key = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            } else if (reportType === "weekly") {
                const week = Math.ceil(date.getDate() / 7);
                key = `Week ${week} - ${date.toLocaleDateString("en-US", { month: "short" })}`;
            } else {
                key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            }

            const existing = salesMap.get(key) || { orders: 0, revenue: 0 };
            existing.orders += 1;
            existing.revenue += order.total_amount || 0;
            salesMap.set(key, existing);

            // Aggregate products
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const name = item.name || 'Unknown Product';
                    const existing = productMap.get(name) || { quantity: 0, revenue: 0 };
                    existing.quantity += item.quantity || 1;
                    existing.revenue += (item.price || 0) * (item.quantity || 1);
                    productMap.set(name, existing);
                });
            }
        });

        setSalesData(
            Array.from(salesMap.entries())
                .map(([period, data]) => ({ period, ...data }))
                .slice(0, 10)
        );

        setTopProducts(
            Array.from(productMap.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
        );

        setLoading(false);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    const exportCSV = () => {
        const headers = ["Period", "Orders", "Revenue"];
        const rows = salesData.map(s => [s.period, s.orders, s.revenue]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sales_report_${reportType}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Reports
                        </h1>
                        <p className="text-slate-500 mt-1">Comprehensive analysis of store performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={reportType} onValueChange={(v: "daily" | "weekly" | "monthly") => setReportType(v)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={exportCSV} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-emerald-100 text-sm">Total Revenue</span>
                                <TrendingUp className="h-5 w-5 text-emerald-200" />
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-100 text-sm">Total Orders</span>
                                <ShoppingBag className="h-5 w-5 text-blue-200" />
                            </div>
                            <p className="text-3xl font-bold">{summary.totalOrders}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-lg shadow-violet-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-violet-100 text-sm">Avg. Order Value</span>
                                <ShoppingBag className="h-5 w-5 text-violet-200" />
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(summary.avgOrderValue)}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg shadow-amber-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-amber-100 text-sm">Products Sold</span>
                                <Package className="h-5 w-5 text-amber-200" />
                            </div>
                            <p className="text-3xl font-bold">{topProducts.reduce((s, p) => s + p.quantity, 0)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-slate-800">Sales Analysis</CardTitle>
                                <CardDescription>By {reportType === "daily" ? "Day" : reportType === "weekly" ? "Week" : "Month"}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(val: number, name: string) => [
                                                name === "revenue" ? formatCurrency(val) : val,
                                                name === "revenue" ? "Revenue" : "Orders"
                                            ]}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border shadow-sm h-full">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-slate-800">Top Selling Products</CardTitle>
                                <CardDescription>Top 5 Performers</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {topProducts.map((product, index) => (
                                        <div key={product.name} className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-amber-500' :
                                                index === 1 ? 'bg-slate-400' :
                                                    index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.quantity} units</p>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                                {formatCurrency(product.revenue)}
                                            </Badge>
                                        </div>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <p className="text-center text-slate-500 py-8">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Sales Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-slate-800">Sales Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Period</TableHead>
                                        <TableHead>Orders Count</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Avg. Order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesData.map((row) => (
                                        <TableRow key={row.period}>
                                            <TableCell className="font-medium">{row.period}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                    {row.orders}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-600">{formatCurrency(row.revenue)}</TableCell>
                                            <TableCell className="text-slate-500">
                                                {formatCurrency(row.orders > 0 ? row.revenue / row.orders : 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
