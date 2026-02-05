import { supabase } from "@/lib/supabase";

export interface Review {
    id: number;
    product_id: number;
    customer_name: string;
    customer_email?: string;
    order_id?: string;
    rating: number;
    title?: string;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ReviewInput {
    product_id: number;
    customer_name: string;
    customer_email?: string;
    order_id?: string;
    rating: number;
    title?: string;
    comment: string;
}

export const reviewsService = {
    async getApprovedReviews(productId: number): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }

        return data as Review[];
    },

    async getAllReviews(): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching all reviews:", error);
            return [];
        }

        return data as Review[];
    },

    async submitReview(review: ReviewInput): Promise<boolean> {
        const { error } = await supabase
            .from('reviews')
            .insert([review]);

        if (error) {
            console.error("Error submitting review:", error);
            return false;
        }

        return true;
    },

    async updateReviewStatus(id: number, status: 'approved' | 'rejected', adminNotes?: string): Promise<boolean> {
        const { error } = await supabase
            .from('reviews')
            .update({
                status,
                admin_notes: adminNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error("Error updating review status:", error);
            return false;
        }

        return true;
    },

    async deleteReview(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting review:", error);
            return false;
        }

        return true;
    },

    async getAverageRating(productId: number): Promise<{ average: number; count: number }> {
        const reviews = await this.getApprovedReviews(productId);

        if (reviews.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / reviews.length;

        return {
            average: Math.round(average * 10) / 10,
            count: reviews.length
        };
    }
};
