import axios from 'axios';
import { Product, PaginatedProductsResponse, FetchProductsParams } from "@/types";

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Fetches products from the backend with filtering, sorting, and pagination.
 * This single function now handles general product listing and searching.
 */
export const fetchProducts = async ({
  pageParam = 1,
  filters,
}: FetchProductsParams): Promise<PaginatedProductsResponse> => {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: '12',
  });

  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters.categories?.length) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters.priceRange) {
    params.append('priceRange', filters.priceRange.join(','));
  }
  if (filters.colors?.length) {
    params.append('colors', filters.colors.join(','));
  }
  if (filters.sizes?.length) {
    params.append('sizes', filters.sizes.join(','));
  }
  if (filters.searchTerm) {
    params.append('searchTerm', filters.searchTerm);
  }

  console.log(`Fetching products with params: ${params.toString()}`);
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Fetches featured products from the backend.
 */
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  console.log("Fetching featured products from backend.");
  const response = await api.get('/products/featured');
  // The backend response is { success: true, products: [...] }
  return response.data.products;
};

/**
 * Fetches a single product by its ID from the backend.
 */
export const fetchProductById = async (id: number): Promise<Product> => {
  console.log(`Fetching product by ID: ${id}`);
  const response = await api.get(`/products/${id}`);
  // The backend response is { success: true, product: {...} }
  return response.data.product;
};

/**
 * This function is now handled by fetchProducts.
 * We keep it for compatibility with the existing useSearchProducts hook,
 * but it just delegates to fetchProducts.
 */
export const searchProducts = async ({
  pageParam = 1,
  searchTerm,
}: { pageParam?: number; searchTerm: string; }): Promise<PaginatedProductsResponse> => {
  console.log(`Searching for "${searchTerm}", page: ${pageParam}`);
  return fetchProducts({ pageParam, filters: { searchTerm } });
};