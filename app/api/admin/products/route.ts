/**
 * Admin Products API
 * GET /api/admin/products - List products with pagination/search/filters
 * POST /api/admin/products - Create new product
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// GET: List products with pagination and search
export async function GET(request: NextRequest) {
    try {
        // 1. Security: Verify admin access
        await requireAdmin();
        const supabaseAdmin = getSupabaseAdmin();

        // 2. Parse query params
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
        const search = searchParams.get("q") || "";
        const category = searchParams.get("category") || "";
        const sort = searchParams.get("sort") || "created_at";
        const dir = searchParams.get("dir") === "asc" ? true : false;

        // 3. Build query
        let query = supabaseAdmin.from("products").select("*", { count: "exact" });

        // Search filter
        if (search.trim()) {
            query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`);
        }

        // Category filter
        if (category) {
            query = query.eq("category", category);
        }

        // Sorting
        const validSortFields = ["created_at", "name", "price", "stockQuantity", "stock", "category"];
        const sortField = validSortFields.includes(sort) ? sort : "created_at";
        query = query.order(sortField, { ascending: dir });

        // Stock filter
        const stockFilter = searchParams.get("stock");
        if (stockFilter === "low") {
            query = query.lt("stockQuantity", 5);
        }

        // Missing data filter
        const missingFilter = searchParams.get("missing");
        if (missingFilter === "true" || missingFilter === "1") {
            // Check for missing images or missing description
            query = query.or("images.is.null,description.is.null,description.eq.''");
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        // 4. Execute
        const { data: rows, count, error } = await query;

        if (error) {
            console.error("[API/Admin/Products] Query Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({
            rows: rows || [],
            total: count || 0,
            page,
            pageSize,
        });

    } catch (error: unknown) {
        console.error("[API/Admin/Products] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST: Create new product
export async function POST(request: NextRequest) {
    try {
        // 1. Security: Verify admin access
        await requireAdmin();
        const supabaseAdmin = getSupabaseAdmin();

        // 2. Parse body
        const body = await request.json();
        const { name, name_ar, price, description, description_ar, images, category, stock, isNew, isBestSeller, isFeatured } = body;

        // 3. Validate required fields
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
            return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
        }

        // 4. Build product object
        const productData = {
            name: name.trim(),
            name_ar: name_ar?.trim() || null,
            price: Number(price),
            description: description?.trim() || "",
            description_ar: description_ar?.trim() || null,
            images: Array.isArray(images) ? images : [],
            category: category || "uncategorized",
            stock: Number(stock) || 0,
            stockQuantity: Number(stock) || 0,
            stockStatus: Number(stock) > 0 ? "in-stock" : "out-of-stock",
            isNew: Boolean(isNew),
            isBestSeller: Boolean(isBestSeller),
            isFeatured: Boolean(isFeatured),
        };

        // 5. Insert
        const { data: newProduct, error: insertError } = await supabaseAdmin
            .from("products")
            .insert(productData)
            .select()
            .single();

        if (insertError) {
            console.error("[API/Admin/Products] Insert Error:", insertError);
            return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
        }

        return NextResponse.json({ product: newProduct }, { status: 201 });

    } catch (error: unknown) {
        console.error("[API/Admin/Products] POST Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
