export interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  _id: string;
  name: string;
  imageUrls: string[];
  description: string;
  category: string;
  variants: ProductVariant[];
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// This represents a single item within the cart, as returned by the backend
export interface CartItem {
  _id: string; // The unique ID of the cart item itself
  productId: Product; // Populated product details
  variantId: string; // The ID of the specific variant
  quantity: number;
  priceAtTime: number;
  nameAtTime: string;
  imageAtTime: string;
  sizeAtTime: string; // New: Snapshot of the variant's size
  colorAtTime: string; // New: Snapshot of the variant's color
}

// This represents the entire cart object from the backend
export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

// New: OrderItem interface for a snapshot of items in an order
export interface OrderItem {
  _id: string;
  productId: string; // Only ID is stored in order, not populated product
  variantId: string;
  quantity: number;
  nameAtTime: string;
  imageAtTime: string;
  priceAtTime: number;
  sizeAtTime: string;
  colorAtTime: string;
}

// New: ShippingAddress interface
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// New: Order interface
export interface Order {
  _id: string;
  userId: string;
  orderNumber: number; // New: Sequential order number
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

// New: WishlistItem interface
export interface WishlistItem {
  _id: string; // The unique ID of the wishlist item itself
  productId: Product; // Populated product details
  variantId: string; // The ID of the specific variant
  nameAtTime: string;
  imageAtTime: string;
  priceAtTime: number;
  sizeAtTime: string;
  colorAtTime: string;
  createdAt: string;
  updatedAt: string;
}

// New: Wishlist interface
export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}


export interface FilterState {
  categories?: string[];
  priceRange?: [number, number];
  colors?: [number, number];
  sizes?: string[];
  sortBy?: string;
  searchTerm?: string;
}

export interface FetchProductsParams {
  pageParam?: number;
  filters: Partial<FilterState>;
}

export interface PaginatedProductsResponse {
  products: Product[];
  nextPage: number | null;
  totalProducts: number;
}

export interface User {
  _id: string;
  email: string;
  userName: string;
  phoneNumber: string;
  isVerified: boolean;
  lastLogin: string; // Date string
  createdAt: string; // Date string
  updatedAt: string; // Date string
}