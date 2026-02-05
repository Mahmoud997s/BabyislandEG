import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/data/products';

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface CheckoutData {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: 'cod' | 'card' | 'vodafone';
}

interface CartStore {
  // State
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  promoDiscount: number;
  checkoutData: CheckoutData | null;
  lastOrder: any | null;

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantColor: string) => void;
  updateQuantity: (productId: string, variantColor: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyPromoCode: (code: string) => boolean;
  setCheckoutData: (data: CheckoutData) => void;
  placeOrder: (totalsOverride?: { shipping: number; total: number }) => Promise<string>;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
}

// ============================================================================
// Constants
// ============================================================================

const PROMO_CODES: Record<string, number> = {
  'WELCOME10': 10,
  'BABY20': 20,
  'VIP15': 15,
};

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 75;

// ============================================================================
// Store
// ============================================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      isOpen: false,
      promoCode: '',
      promoDiscount: 0,
      checkoutData: null,
      lastOrder: null,

      // Add item to cart
      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variant.color === variant.color
          );

          const maxQty = product.stockQuantity ?? 5;

          if (existingIndex > -1) {
            const currentQty = state.items[existingIndex].quantity;
            if (currentQty >= maxQty) return state;

            const newItems = [...state.items];
            newItems[existingIndex].quantity = Math.min(currentQty + quantity, maxQty);
            return { items: newItems, isOpen: true };
          }

          return {
            items: [...state.items, { product, variant, quantity: Math.min(quantity, maxQty) }],
            isOpen: true,
          };
        });
      },

      // Remove item from cart
      removeItem: (productId, variantColor) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant.color === variantColor)
          ),
        }));
      },

      // Update item quantity
      updateQuantity: (productId, variantColor, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantColor);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId && item.variant.color === variantColor) {
              const maxQty = item.product.stockQuantity ?? 5;
              return { ...item, quantity: Math.min(quantity, maxQty) };
            }
            return item;
          }),
        }));
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], promoCode: '', promoDiscount: 0 });
      },

      // Cart visibility
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Promo code
      applyPromoCode: (code) => {
        const discount = PROMO_CODES[code.toUpperCase()];
        if (discount) {
          set({ promoCode: code.toUpperCase(), promoDiscount: discount });
          return true;
        }
        return false;
      },

      // Checkout data
      setCheckoutData: (data) => set({ checkoutData: data }),

      // Place order
      placeOrder: async (totalsOverride) => {
        const state = get();

        const authModule = await import('../store/authStore');
        const { user } = authModule.useAuthStore.getState();
        const { orderService } = await import('../services/orderService');

        const subtotal = state.getSubtotal();
        const shipping = totalsOverride?.shipping ?? state.getShippingFee();
        const total = totalsOverride?.total ?? (subtotal + shipping);

        const order = await orderService.createOrder(
          state.items,
          state.checkoutData!,
          { subtotal, shipping, total },
          user?.id || null
        );

        if (!order) {
          throw new Error("Failed to create order");
        }

        // Send email confirmation (non-blocking)
        import('../services/emailService').then(({ emailService }) => {
          emailService.init();
          emailService.sendOrderConfirmation(order);
        }).catch(err => console.error("[Cart] Email failed:", err));

        set({
          lastOrder: order,
          items: [],
          promoCode: '',
          promoDiscount: 0,
          checkoutData: null,
        });

        return order.id;
      },

      // Computed: Item count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Computed: Subtotal
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      // Computed: Shipping fee
      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      },

      // Computed: Total
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const discountAmount = (subtotal * get().promoDiscount) / 100;
        return subtotal - discountAmount + shipping;
      },
    }),
    {
      name: 'baby-stroller-cart',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    }
  )
);
