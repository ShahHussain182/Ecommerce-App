import { create } from 'zustand';
import { Product, ProductVariant, Wishlist, WishlistItem } from '@/types';
import { toast } from "sonner";
import * as wishlistApi from '@/lib/wishlistApi';

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  wishlistItemIds: Set<string>; // New derived state for quick lookups
  initializeWishlist: () => Promise<void>;
  addItemToWishlist: (product: Product, variant: ProductVariant) => Promise<void>;
  removeItemFromWishlist: (itemId: string) => Promise<void>;
  clearClientWishlist: () => void;
  clearRemoteWishlist: () => Promise<void>;
  isItemInWishlist: (productId: string, variantId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,
  wishlistItemIds: new Set(), // Initialize as an empty Set

  // Helper to update wishlistItemIds
  _updateWishlistItemIds: (items: WishlistItem[]) => {
    const newSet = new Set<string>();
    items.forEach(item => newSet.add(`${item.productId._id}_${item.variantId}`));
    set({ wishlistItemIds: newSet });
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

  // Adds an item via the API and updates the local state with the response
  addItemToWishlist: async (product, variant) => {
    set({ isLoading: true });
    try {
      const updatedWishlist = await wishlistApi.addWishlistItem(product._id, variant._id);
      set({ wishlist: updatedWishlist, isLoading: false });
      get()._updateWishlistItemIds(updatedWishlist.items); // Update derived state
      toast.success(`${product.name} added to wishlist.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to add item to wishlist.";
      toast.error("Error", { description: errorMessage });
      set({ isLoading: false });
    }
  },

  // Removes an item via the API
  removeItemFromWishlist: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const updatedWishlist = await wishlistApi.removeWishlistItem(itemId);
      set({ wishlist: updatedWishlist, isLoading: false });
      get()._updateWishlistItemIds(updatedWishlist.items); // Update derived state
      toast.success("Item removed from wishlist.");
    } catch (error) {
      toast.error("Failed to remove item from wishlist.");
      set({ isLoading: false });
    }
  },

  // Clears the wishlist on the server
  clearRemoteWishlist: async () => {
    set({ isLoading: true });
    try {
      const updatedWishlist = await wishlistApi.clearWishlist();
      set({ wishlist: updatedWishlist, isLoading: false });
      get()._updateWishlistItemIds(updatedWishlist.items); // Update derived state
      toast.success("Wishlist cleared.");
    } catch (error) {
      toast.error("Failed to clear wishlist.");
      set({ isLoading: false });
    }
  },

  // Clears the wishlist locally (used on logout)
  clearClientWishlist: () => {
    set({ wishlist: null, isLoading: false, error: null, wishlistItemIds: new Set() }); // Clear derived state too
  },

  // Checks if a specific product variant is in the wishlist using the Set
  isItemInWishlist: (productId: string, variantId: string) => {
    return get().wishlistItemIds.has(`${productId}_${variantId}`);
  },
}));