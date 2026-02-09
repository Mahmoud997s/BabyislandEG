import { supabaseAdmin } from "@/lib/supabase-admin";
import { Product } from "@/data/products";
import "server-only";

// This service is for Server Utils/Components ONLY.
// It bypasses RLS using supabaseAdmin.

const VALID_CATEGORIES = new Set([
    'baby-care',
    'strollers-gear',
    'feeding',
    'toys',
    'nursery',
    'bathing',
    'clothing',
    'maternity'
]);

const LEGACY_MAP: Record<string, string> = {
    'clothes': 'clothing',
    'mum': 'maternity',
    'mom': 'maternity'
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
            return {
                ids: ['kafh-almntjat', LEGACY_MAP[slug]],
                legacy: slug,
                needsReview: false
            };
        }
    }
    return {
        ids: ['kafh-almntjat', 'uncategorized'],
        needsReview: true
    };
}

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

export const productsServiceServer = {
    async getAllProducts(): Promise<Product[]> {
        if (!supabaseAdmin) return [];
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*, product_analytics(ranking_score)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading products from DB:", error);
            return [];
        }

        return data.map(item => {
            const p = mapDbToProduct(item);
            const analytics = Array.isArray(item.product_analytics) ? item.product_analytics[0] : item.product_analytics;
            if (analytics) p.ranking_score = analytics.ranking_score;
            return p;
        });
    },

    async getProductById(id: string): Promise<Product | undefined> {
        if (!supabaseAdmin) return undefined;
        const { data } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
        if (data) return mapDbToProduct(data);
        return undefined;
    }
};
