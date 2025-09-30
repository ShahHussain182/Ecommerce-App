import { api } from '@/lib/api';
import { User, CustomerGrowthDataPoint } from '@/types';

interface GetAllCustomersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: 'Active' | 'Inactive' | 'VIP' | 'New' | 'Potential' | 'All';
  sortBy?: 'userName' | 'email' | 'createdAt' | 'lastLogin' | 'totalOrders' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedCustomersResponse {
  data: User[];
  totalCustomers: number;
  nextPage: number | null;
}

interface GetCustomerGrowthParams {
  period?: '7days' | '30days' | '1year';
}

export const customerService = {
  /**
   * Fetches all customers (users with role 'user') with pagination, search, and filters.
   */
  async getAllCustomers(params: GetAllCustomersParams = {}): Promise<PaginatedCustomersResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/customers?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * New: Get customer growth data over time for charting.
   */
  async getCustomerGrowthOverTime(params: GetCustomerGrowthParams = {}): Promise<{ data: CustomerGrowthDataPoint[] }> {
    const queryParams = new URLSearchParams();
    if (params.period) {
      queryParams.append('period', params.period);
    }
    const response = await api.get(`/customers/growth-over-time?${queryParams.toString()}`);
    return response.data;
  },
};