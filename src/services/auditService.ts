/**
 * Audit Logging Service
 * Logs admin actions for accountability and security monitoring
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AuditLogEntry {
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    user_id: string;
    user_email?: string;
    ip_address?: string;
}

export const auditService = {
    /**
     * Log an admin action
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            const supabase = await createClient();
            
            await supabase.from("audit_logs").insert({
                action: entry.action,
                resource_type: entry.resource_type,
                resource_id: entry.resource_id,
                details: entry.details,
                user_id: entry.user_id,
                user_email: entry.user_email,
                ip_address: entry.ip_address,
                created_at: new Date().toISOString(),
            });
        } catch (error) {
            // Log to console but don't throw - audit logging should not break operations
            console.error("[AuditService] Failed to log action:", error);
        }
    },

    /**
     * Log product modification
     */
    async logProductChange(
        userId: string,
        userEmail: string,
        action: "create" | "update" | "delete",
        productId: string,
        details?: Record<string, unknown>
    ): Promise<void> {
        await this.log({
            action: `product_${action}`,
            resource_type: "product",
            resource_id: productId,
            details,
            user_id: userId,
            user_email: userEmail,
        });
    },

    /**
     * Log order status change
     */
    async logOrderChange(
        userId: string,
        userEmail: string,
        orderId: string,
        oldStatus: string,
        newStatus: string
    ): Promise<void> {
        await this.log({
            action: "order_status_change",
            resource_type: "order",
            resource_id: orderId,
            details: { old_status: oldStatus, new_status: newStatus },
            user_id: userId,
            user_email: userEmail,
        });
    },

    /**
     * Log failed login attempt
     */
    async logFailedLogin(email: string, ipAddress?: string): Promise<void> {
        await this.log({
            action: "login_failed",
            resource_type: "auth",
            details: { email },
            user_id: "anonymous",
            ip_address: ipAddress,
        });
    },

    /**
     * Log successful admin login
     */
    async logAdminLogin(userId: string, userEmail: string, ipAddress?: string): Promise<void> {
        await this.log({
            action: "admin_login",
            resource_type: "auth",
            user_id: userId,
            user_email: userEmail,
            ip_address: ipAddress,
        });
    },
};
