import { create } from 'zustand';
import { cartApi } from '@/lib/cartApi';
import type { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, variantId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string, variantId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: { _id: '', userId: '', items: [], createdAt: '', updatedAt: '' }, // Initial empty cart
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedCart = await cartApi.getCart();
      set({ cart: fetchedCart });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch cart.' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, variantId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCart = await cartApi.addToCart(productId, variantId, quantity);
      set({ cart: updatedCart });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add item to cart.' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItem: async (productId, variantId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCart = await cartApi.updateCartItem(productId, variantId, quantity);
      set({ cart: updatedCart });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update cart item.' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeCartItem: async (productId, variantId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCart = await cartApi.removeCartItem(productId, variantId);
      set({ cart: updatedCart });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to remove item from cart.' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: () => {
    set((state) => ({
      cart: { ...state.cart, items: [] }, // Clear items locally
    }));
  },
}));