import { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { analyticsService, MonthlyStats, OrderStatusStats, TopProduct } from "@/services/analyticsService";
import {
    Loader2, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package,
    Calendar, Download, ArrowUpRight, ArrowRight, CreditCard, ShoppingBag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AnalyticsPage() {
    const [revenueData, setRevenueData] = useState<MonthlyStats[]>([]);
    const [statusData, setStatusData] = useState<OrderStatusStats[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [inventoryStats, setInventoryStats] = useState<any>({ lowStock: [], totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("year");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [rev, stat, top, recent, inv] = await Promise.all([
                analyticsService.getRevenueData(),
                analyticsService.getOrderStatusData(),
                analyticsService.getTopProducts(),
                analyticsService.getRecentSales(),
                analyticsService.getInventoryStats()
            ]);

            setRevenueData(rev);
            setStatusData(stat);
            setTopProducts(top);
            setRecentSales(recent);
            setInventoryStats(inv);
        } catch (error) {
            console.error("Failed to load analytics", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EGP",
            minimumFractionDigits: 0
        }).format(val);
    };

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = statusData.reduce((acc, curr) => acc + curr.value, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Simulated growth metrics (would calculate real diffs in production)
    const growthMetrics = {
        revenue: 12.5,
        orders: 8.2,
        customers: 5.4,
        aov: -2.1
    };

    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 space-y-8 p-8 max-w-[1600px] mx-auto">

            {/* Top Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Overview
                    </h1>
                    <p className="text-slate-500">
                        Welcome back, here's what's happening with your store today.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-white gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* KPI Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Total Revenue */}
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                                +{growthMetrics.revenue}%
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-indigo-100 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Orders */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{growthMetrics.orders}%
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                            <h3 className="text-3xl font-bold text-slate-900">{totalOrders}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Value */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Package className="w-6 h-6 text-amber-600" />
                            </div>
                            {inventoryStats.lowStock.length > 0 ? (
                                <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    {inventoryStats.lowStock.length} Low Stock
                                </span>
                            ) : (
                                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    Healthy
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-sm font-medium">Inventory Asset Value</p>
                            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(inventoryStats.totalValue)}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Avg Order Value */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg">
                                <CreditCard className="w-6 h-6 text-rose-600" />
                            </div>
                            <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                {growthMetrics.aov}%
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-sm font-medium">Avg. Order Value</p>
                            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(averageOrderValue)}</h3>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card className="shadow-sm border-none ring-1 ring-slate-200">
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>Monthly revenue performance over the current year</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sales by Category / Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full shadow-sm border-none ring-1 ring-slate-200">
                        <CardHeader>
                            <CardTitle>Sales Distribution</CardTitle>
                            <CardDescription>Order status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent & Top Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="h-full shadow-sm border-none ring-1 ring-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Latest orders from your store</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentSales.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No recent sales</p>
                                ) : (
                                    recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
                                                    <ShoppingBag className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{sale.customer_name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(sale.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">{formatCurrency(sale.total_amount)}</p>
                                                <Badge variant="outline" className={`
                                                    capitalize border-0 
                                                    ${sale.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                                        sale.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-slate-50 text-slate-700'}
                                                `}>
                                                    {sale.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-full shadow-sm border-none ring-1 ring-slate-200">
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                            <CardDescription>Best performers by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {topProducts.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No sales data available</p>
                                ) : (
                                    topProducts.map((product, i) => (
                                        <div key={product.name} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                                        {i + 1}
                                                    </span>
                                                    <span className="font-medium text-slate-700 truncate max-w-[200px]" title={product.name}>
                                                        {product.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-500">{product.sales} sales</span>
                                                    <span className="font-bold text-slate-900 w-24 text-right">
                                                        {formatCurrency(product.revenue)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${(product.revenue / (topProducts[0]?.revenue || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
