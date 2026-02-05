import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

// Helper to map DB row to Application Product Type
// Helper to map DB row to Application Product Type
function mapDbToProduct(dbItem: any): Product {
    const isOutOfStock = (dbItem.stock || 0) <= 0;

    // Ensure images have full URL if stored as relative paths
    const price = Number(dbItem.price);

    // Global Fake Discount Strategy:
    // User wants to show "25% Off" on all items, where the current price is the selling price.
    // Original Price = Price / 0.75 (so that Price is 75% of Original).
    const fakeOriginalPrice = Math.round(price / 0.75);

    const rawImages = dbItem.images || [];
    const processedImages = rawImages.map((img: string) => {
        if (img.startsWith('http')) return img;
        return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/store-assets/${img}`;
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
        category: dbItem.category || "lightweight",
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
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading products from DB:", error);
            return [];
        }

        return data.map(mapDbToProduct);
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
                    // Assuming 'reviews' count is a proxy for popularity/sales if 'sales_count' doesn't exist
                    // Or check if 'isBestSeller' is a boolean, we can sort by it (descending puts true first)
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

        return data.map(mapDbToProduct);
        return data.map(mapDbToProduct);
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
