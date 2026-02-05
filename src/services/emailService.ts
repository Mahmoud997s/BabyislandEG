import emailjs from '@emailjs/browser';

// EmailJS Configuration
const PUBLIC_KEY = 'N4FeeFesezMUf2TnM';
const SERVICE_ID = 'service_ze9h3l1';
const TEMPLATE_ID_ORDER_CONFIRMATION = 'template_0d31mk6';

export const emailService = {
    init() {
        emailjs.init(PUBLIC_KEY);
    },

    /**
     * Send order confirmation email to customer
     * @param order - Order data from Supabase (snake_case columns)
     * @returns boolean indicating success
     */
    async sendOrderConfirmation(order: any): Promise<boolean> {
        // Validate order has items
        if (!order?.items?.length) {
            console.warn('[Email] No items in order, skipping email');
            return false;
        }

        // Validate email exists
        if (!order.email) {
            console.warn('[Email] No customer email provided, skipping email');
            return false;
        }

        // Build template parameters
        const templateParams = {
            to_name: order.customer_name || 'عميل عزيز',
            to_email: order.email,
            order_id: order.id,
            order_total: order.total_amount || 0,
            order_date: new Date(order.created_at || Date.now()).toLocaleDateString('ar-EG'),
            items_list: order.items
                .map((item: any) => `${item.quantity}x ${item.product?.name || 'منتج'}`)
                .join('\n'),
            shipping_address: order.shipping_address || '',
            city: order.city || '',
            phone: order.phone || '',
        };

        try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID_ORDER_CONFIRMATION, templateParams);
            console.log('[Email] ✅ Confirmation sent to:', order.email);
            return true;
        } catch (error: any) {
            console.error('[Email] ❌ Failed:', error?.text || error?.message);
            return false;
        }
    }
};
