/**
 * Admin Orders API - Server-side paginated & filterable
 * GET /api/admin/orders
 * 
 * Query Params:
 * - page (default 1)
 * - pageSize (default 25, max 100)
 * - status, payment_status, payment_method
 * - q (search across customer_name/phone/email/id)
 * - from, to (ISO timestamps on created_at)
 * - sort (created_at|total_amount), dir (asc|desc)
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { apiRateLimiter } from "@/lib/rateLimiter";

export const dynamic = 'force-dynamic';

// Validate and clamp page size
function clampPageSize(size: number): number {
    if (isNaN(size) || size < 1) return 25;
    if (size > 100) return 100;
    return size;
}

// Validate page number
function clampPage(page: number): number {
    if (isNaN(page) || page < 1) return 1;
    return page;
}

// Validate sort field
function validateSort(sort: string | null): "created_at" | "total_amount" {
    if (sort === "total_amount") return "total_amount";
    return "created_at";
}

// Validate sort direction
function validateDir(dir: string | null): boolean {
    return dir === "asc";
}

export async function GET(request: NextRequest) {
    try {
        // 1. Security: Verify admin access
        await requireAdmin();
        const supabaseAdmin = getSupabaseAdmin();

        // 2. Rate Limiting (100 req/min for orders to prevent scraping/spam)
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        const limitCheck = apiRateLimiter.check(`admin_api:${ip}`);
        
        if (!limitCheck.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." }, 
                { status: 429, headers: { 'Retry-After': String(Math.ceil(limitCheck.resetIn / 1000)) } }
            );
        }



        // 3. Parse query parameters
        const { searchParams } = new URL(request.url);
        
        const page = clampPage(parseInt(searchParams.get("page") || "1"));
        const pageSize = clampPageSize(parseInt(searchParams.get("pageSize") || "25"));
        const status = searchParams.get("status");
        const paymentStatus = searchParams.get("payment_status");
        const paymentMethod = searchParams.get("payment_method");
        const q = searchParams.get("q")?.trim() || "";
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const sort = validateSort(searchParams.get("sort"));
        const ascending = validateDir(searchParams.get("dir"));

        // 4. Build query
        let query = supabaseAdmin
            .from("orders")
            .select("*", { count: "exact" });

        // Apply filters
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        if (paymentStatus && paymentStatus !== "all") {
            query = query.eq("payment_status", paymentStatus);
        }

        if (paymentMethod && paymentMethod !== "all") {
            query = query.eq("payment_method", paymentMethod);
        }

        // Date range filter
        if (from) {
            query = query.gte("created_at", from);
        }
        if (to) {
            query = query.lte("created_at", to);
        }

        // Search filter (q)
        if (q) {
            // Use OR filter for search across multiple fields
            query = query.or(
                `customer_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,id.ilike.%${q}%`
            );
        }

        // Apply sorting
        query = query.order(sort, { ascending });

        // Apply pagination using range
        const rangeFrom = (page - 1) * pageSize;
        const rangeTo = rangeFrom + pageSize - 1;
        query = query.range(rangeFrom, rangeTo);

        // 5. Execute query
        const { data: rows, error: queryError, count } = await query;

        if (queryError) {
            console.error("[API/Admin/Orders] Query error:", queryError);
            return NextResponse.json(
                { error: "Failed to fetch orders" },
                { status: 500 }
            );
        }

        // 6. Return response
        return NextResponse.json({
            rows: rows || [],
            total: count || 0,
            page,
            pageSize,
        });

    } catch (error: unknown) {
        console.error("[API/Admin/Orders] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
