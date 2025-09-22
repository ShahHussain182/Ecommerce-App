import { create } from 'zustand';
import { Product, ProductVariant, Wishlist, WishlistItem } from '@/types';
import { toast } from "sonner";
import * as wishlistApi from '@/lib/wishlistApi';
import { useAddWishlistItemMutation, useRemoveWishlistItemMutation, useClearWishlistMutation } from '@/hooks/useWishlistMutations';

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  wishlistItemIds: Map<string, string>; // Map<productId_variantId, wishlistItem._id>
}

interface WishlistActions {
  initializeWishlist: () => Promise<void>;
  addItemToWishlist: (product: Product, variant: ProductVariant) => void; // Changed to void return
  removeItemFromWishlist: (itemId: string) => void; // Changed to void return
  clearClientWishlist: () => void;
  clearRemoteWishlist: () => void; // Changed to void return
  _updateWishlistItemIds: (items: WishlistItem[]) => void; // Internal helper
}

export const useWishlistStore = create<WishlistState & WishlistActions>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,
  wishlistItemIds: new Map(), // Initialize as an empty Map

  // Helper to update wishlistItemIds Map
  _updateWishlistItemIds: (items: WishlistItem[]) => {
    const newMap = new Map<string, string>();
    items.forEach(item => newMap.set(`${item.productId._id}_${item.variantId}`, item._id));
    set({ wishlistItemIds: newMap }); // This creates a new Map instance, triggering re-renders
  },

  // Fetches the wishlist from the backend and initializes the store
  initializeWishlist: async () => {
    if (get().isLoading || get().wishlist) return; 
    set({ isLoading: true, error: null });
    try {
      const wishlist = await wishlistApi.getWishlist();
      set({ wishlist, isLoading: false });
      get()._updateWishlistItemIds(wishlist.items); // Update derived state
    } catch (error) {
      console.error("Failed to initialize wishlist:", error);
      set({ isLoading: false, error: "Failed to load wishlist." });
    }
  },

  // Triggers the add item mutation
  addItemToWishlist: (product, variant) => {
    // The mutation hook will handle the actual API call and state updates
    // We need to call the mutation from a component, so this action will just trigger it.
    // For now, we'll keep the direct call here, but ideally, components would call the hook directly.
    // This is a common pattern when mixing Zustand with React Query.
    // The actual mutation is called from the components now.
    // This action is left as a placeholder or for potential future direct Zustand-only logic.
  },

  // Triggers the remove item mutation
  removeItemFromWishlist: (itemId: string) => {
    // The mutation hook will handle the actual API call and state updates
    // This action is left as a placeholder or for potential future direct Zustand-only logic.
  },

  // Clears the wishlist on the server
  clearRemoteWishlist: () => {
    // The mutation hook will handle the actual API call and state updates
    // This action is left as a placeholder or for potential future direct Zustand-only logic.
  },

  // Clears the wishlist locally (used on logout)
  clearClientWishlist: () => {
    set({ wishlist: null, isLoading: false, error: null, wishlistItemIds: new Map() }); // Clear derived state too
  },
}));