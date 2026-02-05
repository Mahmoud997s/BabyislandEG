import { supabase } from '@/lib/supabase';
import { CartItem, CheckoutData } from '@/store/cart';

/**
 * Order status types
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

/**
 * Order interface matching Supabase schema
 */
export interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    email: string;
    phone: string;
    shipping_address: string;
    city: string;
    items: CartItem[];
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    payment_method: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    user_id: string | null;
    notes?: string;
}

export const orderService = {
    /**
     * Create a new order in the database
     */
    async createOrder(
        items: CartItem[],
        checkoutData: CheckoutData,
        totals: { subtotal: number; shipping: number; total: number },
        userId: string | null
    ): Promise<Order | null> {
        const newOrder = {
            created_at: new Date().toISOString(),
            customer_name: checkoutData.name,
            email: checkoutData.email,
            phone: checkoutData.phone,
            shipping_address: checkoutData.address,
            city: checkoutData.city,
            items: items,
            subtotal: totals.subtotal,
            shipping_fee: totals.shipping,
            total_amount: totals.total,
            payment_method: checkoutData.paymentMethod,
            status: 'pending' as OrderStatus,
            payment_status: 'unpaid' as PaymentStatus,
            user_id: userId,
            notes: checkoutData.notes || null
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();

        if (error) {
            console.error('[Order] Failed to create:', error.message);
            return null;
        }

        console.log('[Order] ✅ Created:', data.id);
        return data as Order;
    },

    /**
     * Get orders for a specific user
     */
    async getUserOrders(userId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Order] Failed to fetch user orders:', error.message);
            return [];
        }

        return data as Order[];
    },

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Order] Failed to fetch all orders:', error.message);
            return [];
        }

        return data as Order[];
    },

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('[Order] Failed to update status:', error.message);
            return false;
        }

        return true;
    },

    /**
     * Get single order by ID
     */
    async getOrderById(orderId: string): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('[Order] Failed to fetch order:', error.message);
            return null;
        }

        return data as Order;
    }
};
