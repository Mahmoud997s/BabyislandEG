import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Product } from "@/data/products";
import "server-only";
import { mapDbToProduct } from "@/utils/product-mappers";

// This service is for Server Utils/Components ONLY.
// It bypasses RLS using supabaseAdmin.

export const productsServiceServer = {
    async getAllProducts(): Promise<Product[]> {
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) return [];
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*, product_analytics(ranking_score)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading products from DB:", error);
            return [];
        }

        return (data || []).map((item: any) => {
            const p = mapDbToProduct(item);
            const analytics = Array.isArray(item.product_analytics) ? item.product_analytics[0] : item.product_analytics;
            if (analytics) p.ranking_score = analytics.ranking_score;
            return p;
        });
    },

    async getProductById(id: string): Promise<Product | undefined> {
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) return undefined;
        const { data } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
        if (data) return mapDbToProduct(data);
        return undefined;
    }
};
