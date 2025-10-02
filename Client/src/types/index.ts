export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  _id: string;
  userName: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Add other user properties as needed
}

export interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // Category ID
  images: string[];
  variants: ProductVariant[];
  averageRating: number;
  numberOfReviews: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  // Potentially include populated user/product info if needed on frontend
  user?: {
    _id: string;
    userName: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
}

export interface OrderItem {
  productId: string;
  variantId: string;
  nameAtTime: string;
  imageAtTime: string;
  priceAtTime: number;
  quantity: number;
  sizeAtTime: string;
  colorAtTime: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

// For search filters
export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[]; // Assuming colors are strings like "red", "blue"
  sizes: string[];
  rating: number;
  sort: string;
}

export interface AutocompleteSuggestion {
  _id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
}