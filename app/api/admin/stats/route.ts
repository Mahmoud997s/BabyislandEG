/**
 * Admin Stats API - Real-time aggregated dashboard stats
 * GET /api/admin/stats
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Get start of today in UTC
function getStartOfTodayUTC(): string {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return now.toISOString();
}

// Get date N days ago
function getDaysAgo(days: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
    try {
        // 1. Security: Verify admin access
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = user.app_metadata?.role;
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Ensure supabaseAdmin is available
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const startOfToday = getStartOfTodayUTC();
        const sevenDaysAgo = getDaysAgo(7);

        // 3. Fetch all stats in parallel for optimal performance
        const [
            todayOrdersResult,
            pendingResult,
            shippedResult,
            last7DaysResult,
            lowStockResult,
            totalProductsResult,
        ] = await Promise.all([
            // Orders today (count + revenue)
            supabaseAdmin
                .from("orders")
                .select("total_amount", { count: "exact" })
                .gte("created_at", startOfToday),

            // Pending orders count
            supabaseAdmin
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("status", "pending"),

            // Shipped orders count
            supabaseAdmin
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("status", "shipped"),

            // Last 7 days orders (for chart data)
            supabaseAdmin
                .from("orders")
                .select("created_at, total_amount")
                .gte("created_at", sevenDaysAgo)
                .order("created_at", { ascending: true }),

            // Low stock products (stockQuantity < 5)
            supabaseAdmin
                .from("products")
                .select("id", { count: "exact", head: true })
                .lt("stockQuantity", 5),

            // Total products count
            supabaseAdmin
                .from("products")
                .select("id", { count: "exact", head: true }),
        ]);

        // 4. Process today's stats
        const ordersTodayCount = todayOrdersResult.count || 0;
        const revenueToday = (todayOrdersResult.data || []).reduce(
            (sum, order) => sum + (Number(order.total_amount) || 0),
            0
        );

        // 5. Process last 7 days into daily breakdown
        const dailyMap = new Map<string, { count: number; revenue: number }>();
        
        // Initialize all 7 days with zeros
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - i);
            const dateKey = formatDate(date);
            dailyMap.set(dateKey, { count: 0, revenue: 0 });
        }

        // Populate with actual data
        for (const order of last7DaysResult.data || []) {
            const dateKey = order.created_at.split("T")[0];
            const existing = dailyMap.get(dateKey);
            if (existing) {
                existing.count += 1;
                existing.revenue += Number(order.total_amount) || 0;
            }
        }

        // Convert to array
        const ordersLast7Days = Array.from(dailyMap.entries()).map(([date, data]) => ({
            date,
            count: data.count,
            revenue: data.revenue,
        }));

        // 6. Build response
        const response = {
            orders_today_count: ordersTodayCount,
            revenue_today: revenueToday,
            pending_count: pendingResult.count || 0,
            shipped_count: shippedResult.count || 0,
            low_stock_count: lowStockResult.error ? null : (lowStockResult.count || 0),
            total_products: totalProductsResult.count || 0,
            orders_last_7_days: ordersLast7Days,
        };

        return NextResponse.json(response);

    } catch (error: unknown) {
        console.error("[API/Admin/Stats] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
