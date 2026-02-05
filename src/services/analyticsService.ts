import { supabase } from "@/lib/supabase";

export interface MonthlyStats {
    name: string; // Month Name
    total: number; // Revenue
}

export interface OrderStatusStats {
    name: string; // Status Name
    value: number; // Count
    fill: string; // Color
}

export interface TopProduct {
    name: string;
    sales: number;
    revenue: number;
}

export const analyticsService = {
    async getRevenueData(): Promise<MonthlyStats[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .neq('status', 'cancelled');

        if (error) {
            console.error("Error fetching revenue:", error);
            return [];
        }

        // Aggregate by month
        const monthlyData: { [key: string]: number } = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize all months with 0
        months.forEach(m => monthlyData[m] = 0);

        data.forEach(order => {
            const date = new Date(order.created_at);
            const monthIndex = date.getMonth();
            const key = months[monthIndex];
            monthlyData[key] += (order.total_amount || 0);
        });

        // Convert to array in order
        return months.map(name => ({ name, total: monthlyData[name] }));
    },

    async getOrderStatusData(): Promise<OrderStatusStats[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('status');

        if (error) return [];

        const statusCounts: { [key: string]: number } = {};

        data.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });

        const mapping: { [key: string]: { label: string, color: string } } = {
            "pending": { label: "Pending", color: "#f59e0b" }, // Amber
            "processing": { label: "Processing", color: "#3b82f6" }, // Blue
            "shipped": { label: "Shipped", color: "#8b5cf6" }, // Purple
            "delivered": { label: "Delivered", color: "#10b981" }, // Green
            "cancelled": { label: "Cancelled", color: "#ef4444" }, // Red
        };

        return Object.entries(statusCounts).map(([status, count]) => ({
            name: mapping[status]?.label || status,
            value: count,
            fill: mapping[status]?.color || "#cbd5e1",
        }));
    },

    async getInventoryStats() {
        // Fetch all products to calculate stock value and low stock
        const { data: products } = await supabase.from('products').select('id, name, stock, price');

        if (!products) return { lowStock: [], totalValue: 0 };

        const lowStock = products.filter(p => (p.stock || 0) < 5);
        const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

        return {
            lowStock,
            totalValue
        };
    },

    async getTopProducts(): Promise<TopProduct[]> {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('items')
            .neq('status', 'cancelled');

        if (error || !orders) return [];

        const productStats: { [key: string]: { sales: number, revenue: number } } = {};

        orders.forEach(order => {
            // Check if items is an array (JSONB)
            if (Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    // CartItem structure: { product: { name, price }, quantity }
                    const productName = item.product?.name || item.name; // Fallback for safety
                    const productPrice = item.product?.price || item.price || 0;
                    const quantity = item.quantity || 1;

                    if (productName) {
                        if (!productStats[productName]) {
                            productStats[productName] = { sales: 0, revenue: 0 };
                        }
                        productStats[productName].sales += quantity;
                        productStats[productName].revenue += (productPrice * quantity);
                    }
                });
            }
        });

        return Object.entries(productStats)
            .map(([name, stats]) => ({
                name,
                sales: stats.sales,
                revenue: stats.revenue
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    },

    async getRecentSales() {
        const { data, error } = await supabase
            .from('orders')
            .select('id, customer_name, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) return [];
        return data;
    }
};
