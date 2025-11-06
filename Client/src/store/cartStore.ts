import { create } from 'zustand';
import { Product, ProductVariant, Cart, CartItem } from '@/types';
import { toast } from "sonner";
import * as cartApi from '@/lib/cartApi';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  initializeCart: () => Promise<void>;
  addItem: (product: Product, variant: ProductVariant, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  clearClientCart: () => void; // Renamed to avoid conflict
  clearRemoteCart: () => Promise<void>; // New action for remote clearing
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  // Fetches the cart from the backend and initializes the store
  initializeCart: async () => {
    if (get().cart) return; // Already initialized
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      set({ cart, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      set({ isLoading: false, error: "Failed to load cart." });
    }
  },

  // Adds an item via the API and updates the local state with the response
  addItem: async (product, variant, quantity) => {
    set({ isLoading: true });
    try {
      const updatedCart = await cartApi.addItem(product, variant, quantity);
      set({ cart: updatedCart, isLoading: false });
      toast.success(`${product.name} added to cart.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to add item.";
      toast.error("Error", { description: errorMessage });
      set({ isLoading: false });
    }
  },

  // Removes an item via the API
  removeItem: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      set({ cart: updatedCart, isLoading: false });
      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error("Failed to remove item.");
      set({ isLoading: false });
    }
  },

  // Updates quantity via the API
  updateItemQuantity: async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    set({ isLoading: true });
    try {
      const updatedCart = await cartApi.updateItemQuantity(itemId, newQuantity);
      set({ cart: updatedCart, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update quantity.";
      toast.error("Error", { description: errorMessage });
      set({ isLoading: false });
    }
  },

  // Clears the cart on the server
  clearRemoteCart: async () => {
    set({ isLoading: true });
    try {
      const updatedCart = await cartApi.clearCart();
      set({ cart: updatedCart, isLoading: false });
      toast.success("Cart cleared.");
    } catch (error) {
      toast.error("Failed to clear cart.");
      set({ isLoading: false });
    }
  },

  // Clears the cart locally (used on logout)
  clearClientCart: () => {
    set({ cart: null, isLoading: false, error: null });
  },
}));