import { api } from '@/lib/api';
import { Product, PaginatedResponse, ApiResponse } from '@/types';

interface ProductsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categories?: string;
  priceRange?: string;
  colors?: string;
  sizes?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

export const productService = {
  // Get all products with filtering and pagination
  async getProducts(params: ProductsParams = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/products?${queryParams.toString()}`);
    return response.data;
  },

  // Get single product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products/featured');
    return response.data;
  },

  // Create new product (Admin only - we'll mock this for now)
  async createProduct(productData: any): Promise<ApiResponse<Product>> {
    // Since the backend doesn't have admin product creation yet,
    // we'll simulate this with a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...productData, _id: Date.now().toString() } as Product,
          message: 'Product created successfully'
        });
      }, 1000);
    });
  },

  // Update product (Admin only - mocked)
  async updateProduct(id: string, productData: any): Promise<ApiResponse<Product>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...productData, _id: id } as Product,
          message: 'Product updated successfully'
        });
      }, 1000);
    });
  },

  // Delete product (Admin only - mocked)
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null,
          message: 'Product deleted successfully'
        });
      }, 500);
    });
  }
};
