import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/data/products';

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
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  promoDiscount: number;
  checkoutData: CheckoutData | null;
  lastOrder: {
    orderId: string;
    items: CartItem[];
    total: number;
    checkoutData: CheckoutData;
  } | null;
  
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
  placeOrder: () => string;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: (city: string) => number;
  getTotal: (city?: string) => number;
}

const PROMO_CODES: Record<string, number> = {
  'WELCOME10': 10,
  'BABY20': 20,
  'VIP15': 15,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      promoDiscount: 0,
      checkoutData: null,
      lastOrder: null,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variant.color === variant.color
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems, isOpen: true };
          }

          return {
            items: [...state.items, { product, variant, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantColor) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant.color === variantColor)
          ),
        }));
      },

      updateQuantity: (productId, variantColor, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantColor);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variant.color === variantColor
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], promoCode: '', promoDiscount: 0 });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      applyPromoCode: (code) => {
        const discount = PROMO_CODES[code.toUpperCase()];
        if (discount) {
          set({ promoCode: code.toUpperCase(), promoDiscount: discount });
          return true;
        }
        return false;
      },

      setCheckoutData: (data) => {
        set({ checkoutData: data });
      },

      placeOrder: () => {
        const state = get();
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        set({
          lastOrder: {
            orderId,
            items: state.items,
            total: state.getTotal(state.checkoutData?.city),
            checkoutData: state.checkoutData!,
          },
          items: [],
          promoCode: '',
          promoDiscount: 0,
          checkoutData: null,
        });

        return orderId;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getShippingFee: (city) => {
        const subtotal = get().getSubtotal();
        if (subtotal >= 5000) return 0; // Free shipping over 5000 EGP
        
        const cairoGiza = ['القاهرة', 'الجيزة', 'cairo', 'giza'];
        if (cairoGiza.some((c) => city.toLowerCase().includes(c.toLowerCase()))) {
          return 50;
        }
        return 100; // Other governorates
      },

      getTotal: (city = 'القاهرة') => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee(city);
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
