export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  imageUrls: string[];
  description: string;
  category: string;
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  cartItemId: string;
  quantity: number;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  sortBy: string;
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