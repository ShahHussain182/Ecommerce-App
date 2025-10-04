export interface ProductVariant {
  _id: string;
  size: string; // Required as per backend model
  color: string; // Required as per backend model
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  imageUrls: string[];
  description: string;
  category: string;
  variants: ProductVariant[];
  isFeatured: boolean; // Non-optional as per backend model
  createdAt: string; // Non-optional as per backend model
  updatedAt: string; // Non-optional as per backend model
  averageRating: number;
  numberOfReviews: number;
}

export interface CartItem {
  _id: string; // The unique ID of the cart item itself
  productId: Product; // Populated product details
  variantId: string; // The ID of the specific variant
  quantity: number;
  priceAtTime: number;
  nameAtTime: string;
  imageAtTime: string;
  sizeAtTime: string;
  colorAtTime: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string; // optional
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  userId: string | { _id: string; userName: string; email?: string; }; // Can be string or populated object
  orderNumber: number; // Sequential order number
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

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

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId: string; // Product ID, not fully populated in this context
  userId: {
    _id: string;
    userName: string;
  };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface FilterState {
  categories?: string[];
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'averageRating-desc' | 'numberOfReviews-desc' | 'relevance-desc';
  searchTerm?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
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
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin';
  totalOrders?: number; // Aggregated from backend
  totalSpent?: number; // Aggregated from backend
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}