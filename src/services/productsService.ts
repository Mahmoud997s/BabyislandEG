import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

// Helper to map DB row to Application Product Type

const VALID_CATEGORIES = new Set([
    'baby-care',
    'strollers-gear',
    'feeding',
    'toys',
    'nursery',
    'bathing',
    'clothing',   // NEW (Active)
    'maternity'   // NEW (Active)
]);

const LEGACY_MAP: Record<string, string> = {
    'clothes': 'clothing',       // Map legacy 'clothes' to new standard 'clothing'
    'mum': 'maternity',          // Map legacy 'mum' to 'maternity'
    'mom': 'maternity'           // Map legacy 'mom' to 'maternity'
};

function isValidCategory(ids: any): boolean {
    return Array.isArray(ids) && ids.length >= 2 && VALID_CATEGORIES.has(ids[1]);
}

function resolveCategory(ids: any): { ids: string[], legacy?: string, needsReview: boolean } {
    // 1. Valid Category -> Keep it
    if (isValidCategory(ids)) {
        return { ids, needsReview: false };
    }

    // 2. Legacy Handling -> Map & Track
    if (Array.isArray(ids) && ids.length >= 2) {
        const slug = ids[1];
        if (LEGACY_MAP[slug]) {
            return {
                ids: ['kafh-almntjat', LEGACY_MAP[slug]],
                legacy: slug,
                needsReview: false // It's handled
            };
        }
    }

    // 3. Fallback -> Uncategorized & Flag
    return {
        ids: ['kafh-almntjat', 'uncategorized'],
        needsReview: true
    };
}

// --- Safe Auto-Classifier Logic Removed (Moved to Backend API) ---
// Helper to map DB row to Application Product Type
function mapDbToProduct(dbItem: any): Product {
    const isOutOfStock = (dbItem.stock || 0) <= 0;

    // Resolve Category Logic
    const catResult = resolveCategory(dbItem.category_ids);

    // Ensure images have full URL if stored as relative paths
    const price = Number(dbItem.price);

    // Global Fake Discount Strategy:
    // User wants to show "25% Off" on all items, where the current price is the selling price.
    // Original Price = Price / 0.75 (so that Price is 75% of Original).
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
        // GUARDRAIL: Legacy Mapping + Strict Validation
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
            weight: "N/A",
            maxLoad: "N/A",
            foldType: "N/A",
            reclinePositions: 0,
            wheelType: "Standard",
            suspension: false,
            canopy: "Standard",
            basketSize: "Standard",
            suitableAge: "0+",
            dimensions: "N/A",
            foldedDimensions: "N/A"
        },
        warranty: dbItem.warranty || 1,
        shippingEstimate: dbItem.shippingEstimate || "3-5 business days",
        variants: dbItem.variants || [
            {
                color: "Default",
                colorHex: "#000000",
                images: processedImages,
                inStock: !isOutOfStock
            }
        ]
    };
}

export const productsService = {
    async getAllProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_analytics(ranking_score)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading products from DB:", error);
            return [];
        }

        // Map the joined score
        const mapped = data.map(item => {
            const p = mapDbToProduct(item);
            // Handle joined data
            const analytics = Array.isArray(item.product_analytics) ? item.product_analytics[0] : item.product_analytics;
            if (analytics) p.ranking_score = analytics.ranking_score;
            return p;
        });

        return mapped;
    },

    async getProductsByCategory(category: string): Promise<Product[]> {
        let query = supabase.from('products').select('*');

        if (category !== "all") {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error loading category ${category}:`, error);
            return [];
        }

        return data.map(mapDbToProduct);
    },

    async getBestSellers(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('isBestSeller', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading best sellers:", error);
            return [];
        }

        return data.map(mapDbToProduct);
    },

    async getRelatedProducts(currentId: string, category?: string, limit: number = 4): Promise<Product[]> {
        let query = supabase
            .from('products')
            .select('*')
            .neq('id', currentId); // Exclude current product

        if (category) {
            query = query.eq('category', category);
        }

        // We fetch slightly more to allow for some random-like selection if possible, 
        // or just fetch the limit directly for maximum performance.
        // For strict performance, just fetch limit.
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error("Error loading related products:", error);
            return [];
        }

        let products = data.map(mapDbToProduct);

        // Fallback: If not enough products in category, fetch random others efficiently
        if (products.length < limit) {
            const remaining = limit - products.length;
            const { data: fallbackData } = await supabase
                .from('products')
                .select('*')
                .neq('id', currentId)
                // If we had category, filter OUT this category to avoid duplicates (though ID check handles it mostly)
                //.neq('category', category) // Optional
                .limit(remaining);

            if (fallbackData) {
                const fallbackProducts = fallbackData.map(mapDbToProduct);
                // Filter out duplicates just in case
                const existingIds = new Set(products.map(p => p.id));
                const uniqueFallback = fallbackProducts.filter(p => !existingIds.has(p.id));
                products = [...products, ...uniqueFallback];
            }
        }

        return products;
    },

    async getProductById(id: string): Promise<Product | undefined> {
        // Try searching by ID first (if numeric)
        if (!isNaN(Number(id))) {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data) return mapDbToProduct(data);
        }

        // Fallback: This used to handle slugs or legacy IDs. 
        // For now, let's assume we mostly rely on the numeric ID.
        return undefined;
    },

    async getFilteredProducts(params: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        search?: string;
    }): Promise<Product[]> {
        let query = supabase.from('products').select('*');

        // Category - use simple 'category' column
        if (params.category && params.category !== "all") {
            query = query.eq('category', params.category);
        }

        // Price Range
        if (params.minPrice !== undefined && params.minPrice > 0) {
            query = query.gte('price', params.minPrice);
        }
        if (params.maxPrice !== undefined && params.maxPrice < 50000) {
            query = query.lte('price', params.maxPrice);
        }

        // Search
        if (params.search && params.search.trim().length > 0) {
            query = query.ilike('name', `%${params.search}%`);
        }

        // Sorting
        if (params.sort) {
            switch (params.sort) {
                case 'price-low':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-high':
                    query = query.order('price', { ascending: false });
                    break;
                case 'rating':
                    query = query.order('rating', { ascending: false });
                    break;
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'best-sellers':
                    query = query.order('reviews', { ascending: false });
                    break;
                case 'recommended':
                    // Fallback to reviews since ranking_score column is currently missing
                    // This ensures the "Recommended" tab (default) is not empty
                    query = query.order('reviews', { ascending: false });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error filtered products:", error);
            return [];
        }

        let products = data.map(mapDbToProduct);
        return products;
    },

    async deleteProduct(id: string): Promise<boolean> {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            console.error("Error deleting product:", error);
            return false;
        }
        return true;
    }
};

// Re-export utility if needed by other components
export function sanitizeDescription(input: string): string {
    if (!input) return "";
    return input.trim();
}
