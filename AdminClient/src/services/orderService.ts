import { api } from '@/lib/api';
import { Order, ApiResponse } from '@/types';

interface GetAllOrdersParams {
  page?: number;
  limit?: number;
}

export const orderService = {
  // Get all orders with pagination
  async getAllOrders(params: GetAllOrdersParams = {}): Promise<{ data: Order[]; totalOrders: number; nextPage: number | null }> {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single order by ID
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin function)
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  // Get order analytics/metrics (Admin function)
  async getOrderMetrics(): Promise<any> {
    const response = await api.get('/orders/metrics');
    return response.data;
  }
};