"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export type UserRole = {
    id: number;
    user_id: string;
    role: 'admin' | 'staff' | 'viewer';
    can_manage_products: boolean;
    can_manage_orders: boolean;
    can_manage_customers: boolean;
    can_manage_discounts: boolean;
    can_manage_settings: boolean;
    can_view_reports: boolean;
    can_manage_reviews: boolean;
    created_at: string;
};

export async function getAllRoles() {
    await requireAdmin();
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as UserRole[];
}

export async function updateRole(userId: string, updates: Partial<UserRole>) {
    const admin = await requireAdmin(); // Ensures authenticated admin
    const supabaseAdmin = createAdminClient();

    // Update Role
    const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (error) throw new Error(`Failed to update role: ${error.message}`);

    // Log Activity (Server-side)
    await logActivityServer(admin.id, 'update_role', 'user_role', userId, updates);

    revalidatePath("/admin/roles");
    return { success: true };
}

export async function deleteRole(userId: string) {
    const admin = await requireAdmin();
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete role: ${error.message}`);

    // Log Activity
    await logActivityServer(admin.id, 'delete_role', 'user_role', userId);

    revalidatePath("/admin/roles");
    return { success: true };
}

async function logActivityServer(userId: string, action: string, entityType?: string, entityId?: string, details?: any) {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from('activity_logs').insert([{
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
    }]);
}
