"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Define action types
export type AdminOrderAction = 
    | "changeStatus"
    | "cancelOrder"
    | "markPaid"
    | "refundFull"
    | "refundPartial"
    | "addInternalNote"
    | "updateTracking";

// Helper for audit logging
async function logAdminAction(orderId: string, action: AdminOrderAction, payload: any, performedBy: string) {
    const supabase = await createClient();
    
    // Try to insert into audit_logs if it exists
    const { error } = await supabase.from("admin_audit_logs").insert({
        order_id: orderId,
        action,
        payload,
        performed_by: performedBy,
        timestamp: new Date().toISOString()
    });

    if (error) {
        // Fallback: Log to console or potentially append to order notes if critical
        console.warn(`[Audit Log Failed] ${action} on ${orderId} by ${performedBy}:`, payload);
    }
}

// 1. Change Status
export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient();
    
    // Check auth (assuming robust auth check in middleware or here)
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || user.role !== 'admin') throw new Error("Unauthorized");

    const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, "changeStatus", { status }, "admin"); // Replace "admin" with actual user ID
    revalidatePath("/admin/orders");
    return { success: true };
}

// 2. Cancel Order
export async function cancelOrder(orderId: string, reason: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from("orders")
        .update({ 
            status: "cancelled", 
            notes: `Cancelled: ${reason}`, // Append to notes or use specific field
            updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, "cancelOrder", { reason }, "admin");
    revalidatePath("/admin/orders");
    return { success: true };
}

// 3. Mark as Paid
export async function markOrderAsPaid(orderId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from("orders")
        .update({ 
            payment_status: "paid",
            updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, "markPaid", {}, "admin");
    revalidatePath("/admin/orders");
    return { success: true };
}

// 4. Refund (Full/Partial)
export async function refundOrder(orderId: string, amount: number, type: "full" | "partial") {
    const supabase = await createClient();
    
    const updateData: any = { 
        payment_status: type === "full" ? "refunded" : "partially_refunded", // Ensure expected enum
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, type === "full" ? "refundFull" : "refundPartial", { amount }, "admin");
    revalidatePath("/admin/orders");
    return { success: true };
}

// 5. Add Internal Note
export async function addInternalNote(orderId: string, note: string) {
    const supabase = await createClient();
    
    // Fetch existing notes to append
    const { data: order } = await supabase.from("orders").select("notes").eq("id", orderId).single();
    const existingNotes = order?.notes || "";
    const newNotes = `${existingNotes}\n[${new Date().toISOString()}] Admin: ${note}`.trim();

    const { error } = await supabase
        .from("orders")
        .update({ 
            notes: newNotes,
            updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, "addInternalNote", { note }, "admin");
    revalidatePath("/admin/orders");
    return { success: true };
}

// 6. Update Tracking
export async function updateTracking(orderId: string, trackingInfo: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from("orders")
        .update({ 
            tracking_number: trackingInfo, // Assuming column exists, or store in metadata
            status: "shipped",
            updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);

    if (error) throw new Error(error.message);

    await logAdminAction(orderId, "updateTracking", { trackingInfo }, "admin");
    revalidatePath("/admin/orders");
    return { success: true };
}
