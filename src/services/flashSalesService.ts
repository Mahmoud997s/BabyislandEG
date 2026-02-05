import { supabase } from "@/lib/supabase";

export interface FlashSale {
    id: number;
    name: string;
    description?: string;
    starts_at: string;
    ends_at: string;
    discount_percentage?: number;
    discount_amount?: number;
    product_ids?: number[];
    category?: string;
    active: boolean;
    created_at: string;
}

export const flashSalesService = {
    async getActiveSales(): Promise<FlashSale[]> {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('flash_sales')
            .select('*')
            .eq('active', true)
            .lte('starts_at', now)
            .gte('ends_at', now)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching flash sales:", error);
            return [];
        }

        return data as FlashSale[];
    },

    async getAllSales(): Promise<FlashSale[]> {
        const { data, error } = await supabase
            .from('flash_sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching all flash sales:", error);
            return [];
        }

        return data as FlashSale[];
    },

    async createSale(sale: Partial<FlashSale>): Promise<boolean> {
        const { error } = await supabase
            .from('flash_sales')
            .insert([sale]);

        if (error) {
            console.error("Error creating flash sale:", error);
            return false;
        }

        return true;
    },

    async updateSale(id: number, updates: Partial<FlashSale>): Promise<boolean> {
        const { error } = await supabase
            .from('flash_sales')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error("Error updating flash sale:", error);
            return false;
        }

        return true;
    },

    async deleteSale(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('flash_sales')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting flash sale:", error);
            return false;
        }

        return true;
    },

    getDiscountForProduct(sales: FlashSale[], productId: number, category?: string): { discount: number; sale: FlashSale | null } {
        // Find applicable sale
        const applicableSale = sales.find(sale => {
            // Check if product is in the sale
            if (sale.product_ids && sale.product_ids.includes(productId)) {
                return true;
            }

            // Check if category matches
            if (sale.category && category && sale.category === category) {
                return true;
            }

            // Check if it's a site-wide sale
            if (!sale.product_ids && !sale.category) {
                return true;
            }

            return false;
        });

        if (!applicableSale) {
            return { discount: 0, sale: null };
        }

        const discount = applicableSale.discount_percentage || 0;
        return { discount, sale: applicableSale };
    },

    calculateTimeRemaining(endDate: string): { days: number; hours: number; minutes: number; seconds: number } {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const diff = end - now;

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    }
};
