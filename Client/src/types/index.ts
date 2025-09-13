export interface ProductVariant {
  _id: string; // Changed from id: number
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  _id: string; // Changed from id: number
  name: string;
  imageUrls: string[];
  description: string;
  category: string;
  variants: ProductVariant[];
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  cartItemId: string;
  quantity: number;
}

export interface FilterState {
  categories?: string[];
  priceRange?: [number, number];
  colors?: string[];
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