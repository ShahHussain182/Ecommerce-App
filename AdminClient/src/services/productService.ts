import { api } from '@/lib/api';
import { Product, ApiResponse, ProductsFilterState } from '@/types'; // Import ProductsFilterState
import { createProductSchema, updateProductSchema } from '@/schemas/productSchema'; // Import Zod schemas
import { z } from 'zod';

// Define types for product creation and update based on Zod schemas
export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;

export const productService = {
  // Get all products with filtering and pagination
  async getProducts(params: ProductsFilterState = {}): Promise<{ products: Product[], totalProducts: number, nextPage: number | null }> {
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

  // Create new product (Admin only)
  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (Admin only)
  async updateProduct(id: string, productData: UpdateProductData): Promise<ApiResponse<Product>> {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};