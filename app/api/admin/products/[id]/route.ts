/**
 * Admin Product Single API
 * GET /api/admin/products/[id] - Get single product
 * PATCH /api/admin/products/[id] - Update product
 * DELETE /api/admin/products/[id] - Delete product
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { auditService } from "@/services/auditService";

export const dynamic = "force-dynamic";

// GET: Get single product by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = user.app_metadata?.role;
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { id } = await params;

        const { data: product, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);

    } catch (error: unknown) {
        console.error("[API/Admin/Products/ID] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH: Update product
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = user.app_metadata?.role;
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check product exists
        const { data: existingProduct, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existingProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Build update object (only include fields that are provided)
        const updates: Record<string, unknown> = {};

        if (body.name !== undefined) updates.name = body.name;
        if (body.name_ar !== undefined) updates.name_ar = body.name_ar;
        if (body.price !== undefined) updates.price = Number(body.price);
        if (body.description !== undefined) updates.description = body.description;
        if (body.description_ar !== undefined) updates.description_ar = body.description_ar;
        if (body.images !== undefined) updates.images = body.images;
        if (body.category !== undefined) updates.category = body.category;
        if (body.stock !== undefined) {
            updates.stock = Number(body.stock);
            updates.stockQuantity = Number(body.stock);
            updates.stockStatus = Number(body.stock) > 0 ? "in-stock" : "out-of-stock";
        }
        if (body.stockQuantity !== undefined) {
            updates.stockQuantity = Number(body.stockQuantity);
            updates.stockStatus = Number(body.stockQuantity) > 0 ? "in-stock" : "out-of-stock";
        }
        if (body.isNew !== undefined) updates.isNew = Boolean(body.isNew);
        if (body.isBestSeller !== undefined) updates.isBestSeller = Boolean(body.isBestSeller);
        if (body.isFeatured !== undefined) updates.isFeatured = Boolean(body.isFeatured);
        if (body.category_ids !== undefined) updates.category_ids = body.category_ids;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: "No changes to apply", product: existingProduct });
        }

        // Execute update
        const { data: updatedProduct, error: updateError } = await supabaseAdmin
            .from("products")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("[API/Admin/Products/ID] Update Error:", updateError);
            return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
        }

        // Audit log
        await auditService.logProductChange(user.id, user.email || "unknown", "update", id, updates);

        return NextResponse.json({ product: updatedProduct });

    } catch (error: unknown) {
        console.error("[API/Admin/Products/ID] PATCH Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = user.app_metadata?.role;
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { id } = await params;

        // Check product exists
        const { data: existingProduct, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("id, name")
            .eq("id", id)
            .single();

        if (fetchError || !existingProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Delete
        const { error: deleteError } = await supabaseAdmin
            .from("products")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("[API/Admin/Products/ID] Delete Error:", deleteError);
            return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
        }

        // Audit log
        await auditService.logProductChange(user.id, user.email || "unknown", "delete", id, { name: existingProduct.name });

        return NextResponse.json({ message: "Product deleted successfully" });

    } catch (error: unknown) {
        console.error("[API/Admin/Products/ID] DELETE Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
