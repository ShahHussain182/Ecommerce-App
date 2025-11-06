import { api } from './api';
import type { Category } from '@/types';

export const categoryApi = {
  /**
   * Fetches all categories from the backend.
   */
  async getAllCategories(): Promise<{ categories: Category[] }> {
    const response = await api.get('/categories');
    return response.data;
  },
};