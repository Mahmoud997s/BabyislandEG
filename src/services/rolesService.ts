import { supabase } from "@/lib/supabase";

export interface UserRole {
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
}

export interface ActivityLog {
    id: number;
    user_id: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: any;
    created_at: string;
}

export const rolesService = {
    async getUserRole(userId: string): Promise<UserRole | null> {
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error("Error fetching user role:", error);
            return null;
        }

        return data as UserRole;
    },

    async getAllRoles(): Promise<UserRole[]> {
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching roles:", error);
            return [];
        }

        return data as UserRole[];
    },

    async createRole(role: Partial<UserRole>): Promise<boolean> {
        const { error } = await supabase
            .from('user_roles')
            .insert([role]);

        if (error) {
            console.error("Error creating role:", error);
            return false;
        }

        return true;
    },

    async updateRole(userId: string, updates: Partial<UserRole>): Promise<boolean> {
        const { error } = await supabase
            .from('user_roles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

        if (error) {
            console.error("Error updating role:", error);
            return false;
        }

        return true;
    },

    async deleteRole(userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error("Error deleting role:", error);
            return false;
        }

        return true;
    },

    async logActivity(action: string, entityType?: string, entityId?: string, details?: any): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        await supabase.from('activity_logs').insert([{
            user_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details
        }]);
    },

    async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching activity logs:", error);
            return [];
        }

        return data as ActivityLog[];
    },

    // Permission helpers
    hasPermission(role: UserRole | null, permission: keyof UserRole): boolean {
        if (!role) return false;
        if (role.role === 'admin') return true;
        return !!role[permission];
    }
};
