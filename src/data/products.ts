export interface ProductVariant {
  id?: string;
  name?: string;
  color: string;
  colorHex: string;
  images: string[];
  inStock: boolean;
}

export interface ProductSpec {
  weight: string;
  maxLoad: string;
  foldType?: string;
  reclinePositions?: number;
  wheelType?: string;
  suspension?: boolean;
  canopy?: string;
  basketSize?: string;
  suitableAge?: string;
  dimensions?: string;
  foldedDimensions?: string;
  foldedSize?: string;
  openSize?: string;
}

export interface Product {
  id: string;
  name: string;
  name_ar?: string; // Localized name
  slug: string;
  images?: string[]; // Added for convenience/admin table
  tagline: string;
  tagline_ar?: string; // Localized tagline
  description: string;
  description_ar?: string; // Localized description
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  category: 'lightweight' | 'travel-system' | 'twin' | 'jogger' | 'premium';
  brand: string;
  rating: number;
  reviewCount: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockQuantity?: number;
  features: string[];
  specs: ProductSpec;
  warranty: number; // years
  shippingEstimate: string;
  variants: ProductVariant[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  travelFriendly?: boolean;
  newbornReady?: boolean;
  accessories?: string[];
}

// Deprecated hardcoded list - use productsService instead
export const products: Product[] = [];

// Helper functions (legacy support, but should redirect to service or return null/empty)
export const getBestSellers = () => {
  return products.filter((product) => product.isBestSeller);
};

export const getFeaturedProducts = () => {
  return products.filter((product) => product.isFeatured);
};

export const getProductBySlug = (slug: string) => {
  return products.find((product) => product.slug === slug);
};

export const categories = [
  { id: 'strollers-gear', name: 'عربات ومعدات', count: 45 },
  { id: 'feeding', name: 'تغذية', count: 32 },
  { id: 'toys', name: 'ألعاب', count: 28 },
  { id: 'nursery', name: 'غرفة الطفل', count: 15 },
  { id: 'bathing', name: 'استحمام', count: 12 },
];
