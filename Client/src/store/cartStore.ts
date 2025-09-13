import { create } from 'zustand';
import { Product, ProductVariant, CartItem } from '@/types';
import { toast } from "sonner";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product, variant, quantity) => {
    set((state) => {
      const cartItemId = `${product._id}-${variant._id}`;
      const existingItem = state.items.find((i) => i.cartItemId === cartItemId);

      if (existingItem) {
        toast.info(`${product.name} (${variant.size}, ${variant.color}) is already in the cart.`);
        return { items: state.items };
      }

      const newItem: CartItem = {
        product,
        variant,
        cartItemId,
        quantity: quantity,
      };
      
      toast.success(`${product.name} (${variant.size}, ${variant.color}) added to cart.`);
      return { items: [...state.items, newItem] };
    });
  },
  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
    toast.success(`Item removed from cart.`);
  },
  updateItemQuantity: (cartItemId, newQuantity) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, newQuantity) } // Ensure quantity is at least 1
          : item
      );
      return { items: updatedItems };
    });
  },
  clearCart: () => {
    set({ items: [] });
    toast.success(`Cart cleared.`);
  },
}));