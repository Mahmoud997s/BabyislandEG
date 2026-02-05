import { supabase } from "@/lib/supabase";

export interface Discount {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    min_order_amount: number;
    max_uses: number | null;
    uses_count: number;
    expires_at: string | null;
    active: boolean;
    created_at: string;
}

export interface DiscountInput {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    min_order_amount?: number;
    max_uses?: number | null;
    expires_at?: string | null;
    active?: boolean;
}

export const discountsService = {
    async getAll(): Promise<Discount[]> {
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching discounts:", error);
            return [];
        }
        return data || [];
    },

    async create(discount: DiscountInput): Promise<Discount | null> {
        const { data, error } = await supabase
            .from('discounts')
            .insert([discount])
            .select()
            .single();

        if (error) {
            console.error("Error creating discount:", error);
            return null;
        }
        return data;
    },

    async update(id: string, discount: Partial<DiscountInput>): Promise<boolean> {
        const { error } = await supabase
            .from('discounts')
            .update(discount)
            .eq('id', id);

        if (error) {
            console.error("Error updating discount:", error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('discounts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting discount:", error);
            return false;
        }
        return true;
    },

    async validateCode(code: string, orderTotal: number): Promise<{ valid: boolean; discount?: Discount; error?: string }> {
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('active', true)
            .single();

        if (error || !data) {
            return { valid: false, error: "كود الخصم غير صالح" };
        }

        const discount = data as Discount;

        // Check expiry
        if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
            return { valid: false, error: "كود الخصم منتهي الصلاحية" };
        }

        // Check max uses
        if (discount.max_uses && discount.uses_count >= discount.max_uses) {
            return { valid: false, error: "تم استخدام الكود الحد الأقصى من المرات" };
        }

        // Check minimum order
        if (orderTotal < discount.min_order_amount) {
            return { valid: false, error: `الحد الأدنى للطلب ${discount.min_order_amount} جنيه` };
        }

        return { valid: true, discount };
    },

    async incrementUsage(id: string): Promise<void> {
        await supabase.rpc('increment_discount_usage', { discount_id: id });
    },

    calculateDiscount(discount: Discount, orderTotal: number): number {
        if (discount.type === "percentage") {
            return (orderTotal * discount.value) / 100;
        }
        return Math.min(discount.value, orderTotal);
    }
};
