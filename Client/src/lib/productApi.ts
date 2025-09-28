import { api } from './api';
import { FilterState, PaginatedProductsResponse, Product } from '@/types';

interface FetchProductsParams {
  pageParam?: number;
  filters: Partial<FilterState>;
}

interface SearchProductsParams {
  pageParam?: number;
  searchTerm: string;
}

/**
 * Fetches featured products.
 */
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products/featured');
  return response.data.products;
};

/**
 * Fetches products with pagination and filters.
 */
export const fetchProducts = async ({ pageParam = 1, filters }: FetchProductsParams): Promise<PaginatedProductsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', pageParam.toString());
  queryParams.append('limit', '12'); // Default limit for product grid

  if (filters.categories && filters.categories.length > 0) {
    queryParams.append('categories', filters.categories.join(','));
  }
  if (filters.priceRange) {
    queryParams.append('priceRange', `${filters.priceRange[0]},${filters.priceRange[1]}`);
  }
  if (filters.colors && filters.colors.length > 0) {
    queryParams.append('colors', filters.colors.join(','));
  }
  if (filters.sizes && filters.sizes.length > 0) {
    queryParams.append('sizes', filters.sizes.join(','));
  }
  if (filters.sortBy) {
    queryParams.append('sortBy', filters.sortBy);
  }

  const response = await api.get(`/products?${queryParams.toString()}`);
  return response.data;
};

/**
 * Fetches a single product by its ID.
 */
export const fetchProductById = async (productId: string): Promise<Product> => {
  const response = await api.get(`/products/${productId}`);
  return response.data.product;
};

/**
 * Searches for products with pagination.
 */
export const searchProducts = async ({ pageParam = 1, searchTerm }: SearchProductsParams): Promise<PaginatedProductsResponse> => {
  const response = await api.get(`/products?page=${pageParam}&limit=12&searchTerm=${encodeURIComponent(searchTerm)}`);
  return response.data;
};