import { api } from './api';
import type { Cart, CartItem } from '@/types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data.data;
  },
  addToCart: async (productId: string, variantId: string, quantity: number): Promise<Cart> => {
    const response = await api.post('/cart', { productId, variantId, quantity });
    return response.data.data;
  },
  updateCartItem: async (productId: string, variantId: string, quantity: number): Promise<Cart> => {
    const response = await api.put('/cart', { productId, variantId, quantity });
    return response.data.data;
  },
  removeCartItem: async (productId: string, variantId: string): Promise<Cart> => {
    const response = await api.delete('/cart', { data: { productId, variantId } });
    return response.data.data;
  },
  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear');
  },
};