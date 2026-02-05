import { supabase } from "@/lib/supabase";

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    ordersCount: number;
    totalSpent: number;
    lastOrderDate: string;
    is_banned?: boolean;
}

export const customersService = {
    async getAll(): Promise<Customer[]> {
        // 1. Fetch all profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        // 2. Fetch all orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, customer_name, email, phone, city, total_amount, created_at, user_id')
            .order('created_at', { ascending: false });

        if (profilesError) console.error("Error fetching profiles:", profilesError);
        if (ordersError) console.error("Error fetching orders:", ordersError);

        const customerMap = new Map<string, Customer>();

        // Process profiles first (Registered Users)
        if (profiles) {
            profiles.forEach(profile => {
                if (profile.role === 'admin') return; // Skip admins

                customerMap.set(profile.email, {
                    id: profile.id, // UUID
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone || '',
                    city: '', // Will be filled from orders
                    ordersCount: 0,
                    totalSpent: 0,
                    lastOrderDate: profile.created_at, // Access created_at
                    is_banned: profile.is_banned || false // Add is_banned check
                });
            });
        }

        // Process orders
        if (orders) {
            orders.forEach(order => {
                // Try to find by User ID first, then Email
                let customer: Customer | undefined;

                // Find by email if exists in map
                if (order.email && customerMap.has(order.email)) {
                    customer = customerMap.get(order.email);
                }
                // Guest users (not in profiles)
                else {
                    const key = order.email || order.phone || 'unknown';
                    if (!customerMap.has(key)) {
                        customerMap.set(key, {
                            id: key, // Use email/phone as ID for guests
                            name: order.customer_name || 'Guest',
                            email: order.email || '',
                            phone: order.phone || '',
                            city: order.city || '',
                            ordersCount: 0,
                            totalSpent: 0,
                            lastOrderDate: order.created_at,
                            is_banned: false
                        });
                        customer = customerMap.get(key);
                    } else {
                        customer = customerMap.get(key);
                    }
                }

                if (customer) {
                    customer.ordersCount += 1;
                    customer.totalSpent += order.total_amount || 0;
                    if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                        customer.lastOrderDate = order.created_at;
                    }
                    if (!customer.city && order.city) {
                        customer.city = order.city;
                    }
                }
            });
        }

        return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    },

    async getCustomerOrders(phone: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('phone', phone)
            .order('created_at', { ascending: false });

        return data || [];
    },

    async toggleBanStatus(userId: string, currentStatus: boolean): Promise<boolean> {
        // Only works for registered users (UUID)
        if (!userId.includes('-')) return false;

        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: !currentStatus })
            .eq('id', userId);

        if (error) {
            console.error("Error toggling ban status:", error);
            return false;
        }
        return true;
    }
};
