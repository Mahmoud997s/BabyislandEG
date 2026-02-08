import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

// Re-export shared Product type to ensure consumers use the correct one
export type { Product };

export interface WishlistItem {
    id: number;
    user_id: string;
    product_id: number;
    created_at: string;
    product?: Product;
}

export const wishlistService = {
    async getWishlist(userId: string): Promise<WishlistItem[]> {
        const { data, error } = await supabase
            .from('wishlists')
            .select(`
                *,
                products (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching wishlist:", error);
            return [];
        }

        return data.map(item => {
            let product: Product | undefined = undefined;
            if (item.products) {
                const dbItem = item.products;

                // Map DB item to Application Product
                product = {
                    id: String(dbItem.id),
                    name: dbItem.name,
                    name_ar: dbItem.name_ar,
                    slug: dbItem.slug || '',
                    price: Number(dbItem.price),
                    images: (dbItem.images || []).map((img: string) =>
                        img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/store-assets/${img}`
                    ),
                    compareAtPrice: Math.round(Number(dbItem.price) / 0.75),
                    discountPercentage: 25,
                    rating: Number(dbItem.rating) || 4.5,
                    reviewCount: Number(dbItem.reviews) || 0,
                    stockStatus: (dbItem.stock || 0) <= 0 ? "out-of-stock" : "in-stock",
                    stockQuantity: dbItem.stock || 0,
                    description: dbItem.description || "",
                    description_ar: dbItem.description_ar,
                    features: dbItem.features || [],
                    category: dbItem.category || "lightweight",
                    brand: dbItem.brand || "Generic",
                    specs: dbItem.specs || {},
                    warranty: dbItem.warranty || 1,
                    shippingEstimate: dbItem.shippingEstimate || "3-5 business days",
                    variants: dbItem.variants || [],
                    tagline: dbItem.tagline || "",
                    tagline_ar: dbItem.tagline_ar
                } as Product;
            }

            return {
                ...item,
                product
            };
        }) as WishlistItem[];
    },

    async addToWishlist(userId: string, productId: string | number): Promise<boolean> {
        const pid = Number(productId);
        if (isNaN(pid)) return false;

        const { error } = await supabase
            .from('wishlists')
            .insert([{ user_id: userId, product_id: pid }]);

        if (error) {
            console.error("Error adding to wishlist:", error);
            return false;
        }

        return true;
    },

    async removeFromWishlist(userId: string, productId: string | number): Promise<boolean> {
        const pid = Number(productId);
        if (isNaN(pid)) return false;

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', pid);

        if (error) {
            console.error("Error removing from wishlist:", error);
            return false;
        }

        return true;
    },

    async isInWishlist(userId: string, productId: string | number): Promise<boolean> {
        const pid = Number(productId);
        if (isNaN(pid)) return false;

        const { data, error } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', pid)
            .single();

        return !!data && !error;
    },

    async toggleWishlist(userId: string, productId: string | number): Promise<boolean> {
        const inWishlist = await this.isInWishlist(userId, productId);

        if (inWishlist) {
            return await this.removeFromWishlist(userId, productId);
        } else {
            return await this.addToWishlist(userId, productId);
        }
    }
};
