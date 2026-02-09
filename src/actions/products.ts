"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

function getAdminClient() {
    return getSupabaseAdmin();
}

export async function deleteProduct(id: string) {
    try {
        const admin = getAdminClient();
        const { error } = await admin.from("products").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        throw error;
    }
}

export async function toggleProductField(id: string, field: string, value: boolean) {
    try {
        const admin = getAdminClient();
        const { error } = await admin
            .from("products")
            .update({ [field]: value })
            .eq("id", id);
        
        if (error) throw error;
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error: any) {
        console.error(`Toggle ${field} error:`, error);
        throw new Error(error.message);
    }
}

export async function migrateProducts(products: any[]) {
    // Basic migration logic if needed to be exposed via action
    // Usually usage of supabase-admin directly in the loop
    // Implementation skipped for brevity unless needed
    return { success: true };
}

export async function bulkDeleteProducts(ids: string[]) {
    try {
        const admin = getAdminClient();
        const { error } = await admin.from("products").delete().in("id", ids);
        if (error) throw error;
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("Bulk delete products error:", error);
        throw error;
    }
}
