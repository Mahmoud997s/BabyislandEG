import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

// Client-side service. Uses 'supabase' (anon) for public data, and API routes for admin actions.

const VALID_CATEGORIES = new Set([
    'baby-care', 'strollers-gear', 'feeding', 'toys', 'nursery', 'bathing', 'clothing', 'maternity'
]);

const LEGACY_MAP: Record<string, string> = {
    'clothes': 'clothing', 'mum': 'maternity', 'mom': 'maternity'
};

function isValidCategory(ids: any): boolean {
    return Array.isArray(ids) && ids.length >= 2 && VALID_CATEGORIES.has(ids[1]);
}

function resolveCategory(ids: any): { ids: string[], legacy?: string, needsReview: boolean } {
    if (isValidCategory(ids)) {
        return { ids, needsReview: false };
    }
    if (Array.isArray(ids) && ids.length >= 2) {
        const slug = ids[1];
        if (LEGACY_MAP[slug]) {
            return { ids: ['kafh-almntjat', LEGACY_MAP[slug]], legacy: slug, needsReview: false };
        }
    }
    return { ids: ['kafh-almntjat', 'uncategorized'], needsReview: true };
}

// Export for use in other files if needed
export function mapDbToProduct(dbItem: any): Product {
    const isOutOfStock = (dbItem.stock || 0) <= 0;
    const catResult = resolveCategory(dbItem.category_ids);
    const price = Number(dbItem.price);
    const fakeOriginalPrice = Math.round(price / 0.75);

    const rawImages = dbItem.images || [];
    const processedImages = rawImages.map((img: string) => {
        if (img.startsWith('http')) return img;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/store-assets/${img}`;
    });

    return {
        id: String(dbItem.id),
        name: dbItem.name,
        name_ar: dbItem.name_ar,
        slug: dbItem.slug || dbItem.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        price: price,
        images: processedImages,
        compareAtPrice: fakeOriginalPrice,
        discountPercentage: 25,
        rating: Number(dbItem.rating) || 4.5,
        reviewCount: Number(dbItem.reviews) || 0,
        stockStatus: isOutOfStock ? "out-of-stock" : "in-stock",
        stockQuantity: dbItem.stock || 0,
        description: dbItem.description || "",
        description_ar: dbItem.description_ar,
        features: dbItem.features || [],
        category: catResult.ids[1] || "uncategorized",
        category_ids: catResult.ids,
        legacyCategory: catResult.legacy,
        needsReview: dbItem.needsReview || catResult.needsReview,
        brand: dbItem.brand || "Generic",
        isNew: dbItem.isNew || false,
        isBestSeller: dbItem.isBestSeller || false,
        isFeatured: dbItem.isFeatured || false,
        tagline: dbItem.tagline || "",
        tagline_ar: dbItem.tagline_ar,
        specs: dbItem.specs || {
            weight: "N/A", maxLoad: "N/A", foldType: "N/A", reclinePositions: 0,
            wheelType: "Standard", suspension: false, canopy: "Standard",
            basketSize: "Standard", suitableAge: "0+", dimensions: "N/A", foldedDimensions: "N/A"
        },
        warranty: dbItem.warranty || 1,
        shippingEstimate: dbItem.shippingEstimate || "3-5 business days",
        variants: dbItem.variants || [
            { color: "Default", colorHex: "#000000", images: processedImages, inStock: !isOutOfStock }
        ]
    };
}

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
