/**
 * Admin Order Details API
 * GET /api/admin/orders/[id] - Get single order
 * PATCH /api/admin/orders/[id] - Update order status/notes
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { auditService } from "@/services/auditService";

export const dynamic = "force-dynamic";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
};

// Validate status transition
function isValidTransition(currentStatus: string, newStatus: string): boolean {
    // Allow same status (no-op)
    if (currentStatus === newStatus) return true;
    // Check valid transitions
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
}

// GET: Fetch single order by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { id } = await params;

        // 2. Fetch order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);

    } catch (error: unknown) {
        console.error("[API/Admin/Orders/ID] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH: Update order status and/or notes
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status: newStatus, notes } = body;

        // 2. Fetch current order
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !currentOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 3. Build update object
        const updates: Record<string, unknown> = {};
        let statusChanged = false;

        // Handle status update
        if (newStatus && newStatus !== currentOrder.status) {
            // Validate transition
            if (!isValidTransition(currentOrder.status, newStatus)) {
                return NextResponse.json(
                    { 
                        error: `Invalid status transition: ${currentOrder.status} → ${newStatus}`,
                        allowed: VALID_TRANSITIONS[currentOrder.status] || []
                    },
                    { status: 400 }
                );
            }
            updates.status = newStatus;
            statusChanged = true;
        }

        // Handle notes update
        if (notes !== undefined) {
            updates.notes = notes;
        }

        // Check if there's anything to update
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: "No changes to apply", order: currentOrder });
        }

        // 4. Apply update
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
            .from("orders")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("[API/Admin/Orders/ID] Update Error:", updateError);
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
        }

        // 5. Audit log for status changes
        if (statusChanged) {
            await auditService.logOrderChange(
                user.id,
                user.email || "unknown",
                id,
                currentOrder.status,
                newStatus
            );
        }

        // 6. Audit log for notes changes
        if (notes !== undefined && notes !== currentOrder.notes) {
            await auditService.log({
                action: "order_notes_update",
                resource_type: "order",
                resource_id: id,
                details: { old_notes: currentOrder.notes, new_notes: notes },
                user_id: user.id,
                user_email: user.email,
            });
        }

        return NextResponse.json({
            message: "Order updated successfully",
            order: updatedOrder,
        });

    } catch (error: unknown) {
        console.error("[API/Admin/Orders/ID] PATCH Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
