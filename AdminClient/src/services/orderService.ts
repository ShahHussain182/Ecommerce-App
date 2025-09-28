import { api } from '@/lib/api';
import { Order, ApiResponse, OrderStatus } from '@/types'; // Import OrderStatus

interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: OrderStatus | 'All'; // Add status filter
  sortBy?: 'date' | 'total'; // Add sort by
  sortOrder?: 'asc' | 'desc'; // Add sort order
}

export const orderService = {
  // Get all orders with pagination, search, and filters
  async getAllOrders(params: GetAllOrdersParams = {}): Promise<{ data: Order[]; totalOrders: number; nextPage: number | null }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/orders/admin?${queryParams.toString()}`); // Use /orders/admin endpoint
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