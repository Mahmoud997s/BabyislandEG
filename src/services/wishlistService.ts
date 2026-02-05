import { supabase } from "@/lib/supabase";

export interface Product {
    id: number;
    name: string;
    price: number;
    images?: string[];
    [key: string]: any;
}

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

        return data.map(item => ({
            ...item,
            product: item.products
        })) as WishlistItem[];
    },

    async addToWishlist(userId: string, productId: number): Promise<boolean> {
        const { error } = await supabase
            .from('wishlists')
            .insert([{ user_id: userId, product_id: productId }]);

        if (error) {
            console.error("Error adding to wishlist:", error);
            return false;
        }

        return true;
    },

    async removeFromWishlist(userId: string, productId: number): Promise<boolean> {
        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) {
            console.error("Error removing from wishlist:", error);
            return false;
        }

        return true;
    },

    async isInWishlist(userId: string, productId: number): Promise<boolean> {
        const { data, error } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        return !!data && !error;
    },

    async toggleWishlist(userId: string, productId: number): Promise<boolean> {
        const inWishlist = await this.isInWishlist(userId, productId);

        if (inWishlist) {
            return await this.removeFromWishlist(userId, productId);
        } else {
            return await this.addToWishlist(userId, productId);
        }
    }
};
