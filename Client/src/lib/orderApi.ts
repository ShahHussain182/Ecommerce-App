import { api } from './api';
import type { CreateOrderPayload, Order } from '@/types';

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post('/orders', payload);
    return response.data.data;
  },
  // Add other order-related functions here if needed
};