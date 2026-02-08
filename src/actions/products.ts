"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

/**
 * Toggle boolean fields on a product.
 * @param productId Product ID
 * @param field Field name (isBestSeller, isNew)
 * @param value New boolean value
 */
export async function toggleProductField(
    productId: string,
    field: "isBestSeller" | "isNew",
    value: boolean
) {
    // 1. Authenticate & Authorize
    await requireAdmin();

    // 2. Perform Admin Update (Bypass RLS)
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("products")
        .update({ [field]: value })
        .eq("id", productId);

    if (error) {
        throw new Error(`Failed to update ${field}: ${error.message}`);
    }

    // 3. Revalidate Path
    revalidatePath("/admin/products");

    return { success: true };
}

/**
 * Delete a product.
 * @param productId Product ID
 */
export async function deleteProduct(productId: string) {
    // 1. Authenticate & Authorize
    await requireAdmin();

    // 2. Perform Admin Delete (Bypass RLS)
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }

    revalidatePath("/admin/products");
    return { success: true };
}

/**
 * Bulk delete products.
 * @param productIds Array of product IDs
 */
export async function bulkDeleteProducts(productIds: string[]) {
    await requireAdmin();
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .in("id", productIds);

    if (error) {
        throw new Error(`Failed to delete products: ${error.message}`);
    }

    revalidatePath("/admin/products");
    return { success: true };
}

/**
 * Migrate products (Bulk Insert).
 */
export async function migrateProducts(products: any[]) {
    await requireAdmin();
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("products")
        .insert(products);

    if (error) {
        throw new Error(`Migration failed: ${error.message}`);
    }

    revalidatePath("/admin/products");
    return { success: true };
}
