import { api } from '@/lib/api';
import { User } from '@/types';

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
};