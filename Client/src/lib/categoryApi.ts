import { api } from './api';
import type { Category } from '@/types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },
};