// Product Types
export interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrls: string[];
  isFeatured: boolean;
  variants: ProductVariant[];
  averageRating: number;
  numberOfReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  _id: string;
  productId: string;
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
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  userId: string;
  orderNumber: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  _id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Cart Types
export interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product: Product;
  salesCount: number;
  revenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  imageUrls: string[];
  isFeatured: boolean;
  variants: {
    size: string;
    color: string;
    price: number;
    stock: number;
  }[];
}

export interface OrderUpdateData {
  status: OrderStatus;
}
