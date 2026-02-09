import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";
import { mapDbToProduct } from "@/utils/product-mappers";

// Client-side service. Uses 'supabase' (anon) for public data, and API routes for admin actions.
// Shared logic is imported from @/utils/product-mappers to avoid spaghetti.

export const productsService = {

    // PUBLIC: Uses Anon Client
    async getAllProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_analytics(ranking_score)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading products:", error);
            return [];
        }

        return data.map(item => {
            const p = mapDbToProduct(item);
            const analytics = Array.isArray(item.product_analytics) ? item.product_analytics[0] : item.product_analytics;
            if (analytics) p.ranking_score = analytics.ranking_score;
            return p;
        });
    },

    // ADMIN: Uses API Route (requires admin cookie)
    async getAdminProducts(page = 1, pageSize = 50, search = ""): Promise<{ rows: Product[], total: number }> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            q: search,
            sort: "created_at",
            dir: "desc"
        });

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch admin products");
        
        const json = await res.json();
        return {
            rows: json.rows.map(mapDbToProduct),
            total: json.total
        };
    },

    async getProductsByCategory(category: string): Promise<Product[]> {
        let query = supabase.from('products').select('*');
        if (category !== "all") query = query.eq('category', category);
        const { data, error } = await query;
        if (error) return [];
        return data.map(mapDbToProduct);
    },

    async getBestSellers(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('isBestSeller', true)
            .order('created_at', { ascending: false });
        if (error) return [];
        return data.map(mapDbToProduct);
    },

    async getRelatedProducts(currentId: string, category?: string, limit: number = 4): Promise<Product[]> {
        let query = supabase.from('products').select('*').neq('id', currentId);
        if (category) query = query.eq('category', category);
        query = query.limit(limit);
        const { data, error } = await query;
        if (error) return [];
        let products = data.map(mapDbToProduct);
        
        if (products.length < limit) {
             const { data: fallback } = await supabase
                .from('products')
                .select('*')
                .neq('id', currentId)
                .limit(limit - products.length);
             if (fallback) {
                 const newP = fallback.map(mapDbToProduct);
                 products = [...products, ...newP.filter(p => !products.find(e => e.id === p.id))];
             }
        }
        return products;
    },

    async getProductById(id: string): Promise<Product | undefined> {
        if (!isNaN(Number(id))) {
            const { data } = await supabase.from('products').select('*').eq('id', id).single();
            if (data) return mapDbToProduct(data);
        }
        return undefined;
    },

    async getFilteredProducts(params: any): Promise<Product[]> {
        let query = supabase.from('products').select('*');
        if (params.category && params.category !== "all") query = query.eq('category', params.category);
        if (params.minPrice) query = query.gte('price', params.minPrice);
        if (params.maxPrice) query = query.lte('price', params.maxPrice);
        if (params.search) query = query.ilike('name', `%${params.search}%`);
        
        // Simple sorting mapping
        if (params.sort === 'price-low') query = query.order('price', { ascending: true });
        else if (params.sort === 'price-high') query = query.order('price', { ascending: false });
        else if (params.sort === 'rating') query = query.order('rating', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) return [];
        return data.map(mapDbToProduct);
    },

    // ADMIN: Uses API Route
    async deleteProduct(id: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            return res.ok;
        } catch (e) {
            console.error("Delete failed", e);
            return false;
        }
    }
};

export function sanitizeDescription(input: string): string {
    return input ? input.trim() : "";
}
