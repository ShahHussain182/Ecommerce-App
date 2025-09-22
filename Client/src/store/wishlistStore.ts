import { create } from 'zustand';
import { Product, ProductVariant, Wishlist, WishlistItem } from '@/types';
import { toast } from "sonner";
import * as wishlistApi from '@/lib/wishlistApi';

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  wishlistItemIds: Map<string, string>; // Map<productId_variantId, wishlistItem._id>
}

interface WishlistActions {
  initializeWishlist: () => Promise<void>;
  addItemToWishlist: (product: Product, variant: ProductVariant) => Promise<void>;
  removeItemFromWishlist: (itemId: string) => Promise<void>;
  clearClientWishlist: () => void;
  clearRemoteWishlist: () => Promise<void>;
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

  // Adds an item via the API and updates the local state with the response
  addItemToWishlist: async (product, variant) => {
    const { wishlist: oldWishlist, wishlistItemIds: oldWishlistItemIds } = get();
    const tempId = `temp_${Date.now()}`; // Temporary ID for optimistic update

    // Create an optimistic item with available product/variant data
    const optimisticItem: WishlistItem = {
      _id: tempId,
      productId: product, // Full product object for local display
      variantId: variant._id,
      nameAtTime: product.name,
      imageAtTime: product.imageUrls[0] || '/placeholder.svg',
      priceAtTime: variant.price,
      sizeAtTime: variant.size,
      colorAtTime: variant.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update the state
    set((state) => {
      const currentItems = state.wishlist?.items || [];
      const newItems = [...currentItems, optimisticItem];
      const newWishlist = {
        ...(state.wishlist || { _id: 'temp', userId: 'temp', items: [], createdAt: '', updatedAt: '' }), // Create a basic wishlist if null
        items: newItems,
        totalItems: newItems.length,
      };
      const newWishlistItemIds = new Map(state.wishlistItemIds);
      newWishlistItemIds.set(`${product._id}_${variant._id}`, tempId); // Map product-variant to temp ID
      return {
        wishlist: newWishlist,
        wishlistItemIds: newWishlistItemIds,
        isLoading: true, // Still set isLoading for the API call
      };
    });

    try {
      const updatedWishlist = await wishlistApi.addWishlistItem(product._id, variant._id);
      // On success, replace the optimistic item with the actual one from the backend
      set((state) => {
        const finalWishlist = updatedWishlist;
        const finalWishlistItemIds = new Map(state.wishlistItemIds);
        // Remove the temporary ID mapping
        finalWishlistItemIds.delete(`${product._id}_${variant._id}`);
        // Add the actual ID mapping
        const actualItem = finalWishlist.items.find(item => item.productId._id === product._id && item.variantId === variant._id);
        if (actualItem) {
          finalWishlistItemIds.set(`${product._id}_${variant._id}`, actualItem._id);
        }
        return {
          wishlist: finalWishlist,
          wishlistItemIds: finalWishlistItemIds,
          isLoading: false,
        };
      });
      toast.success(`${product.name} added to wishlist.`);
    } catch (error: any) {
      // On error, revert to the old state
      set({
        wishlist: oldWishlist,
        wishlistItemIds: oldWishlistItemIds,
        isLoading: false,
      });
      const errorMessage = error.response?.data?.message || "Failed to add item to wishlist.";
      toast.error("Error", { description: errorMessage });
    }
  },

  // Removes an item via the API
  removeItemFromWishlist: async (itemId: string) => {
    const { wishlist: oldWishlist, wishlistItemIds: oldWishlistItemIds } = get();

    // Find the item to be removed to get its product/variant IDs for map update
    const removedItem = oldWishlist?.items.find(item => item._id === itemId);

    // Optimistically update the state
    set((state) => {
      const currentItems = state.wishlist?.items || [];
      const newItems = currentItems.filter(item => item._id !== itemId);
      const newWishlist = {
        ...(state.wishlist || { _id: 'temp', userId: 'temp', items: [], createdAt: '', updatedAt: '' }),
        items: newItems,
        totalItems: newItems.length,
      };
      const newWishlistItemIds = new Map(state.wishlistItemIds);
      if (removedItem) {
        newWishlistItemIds.delete(`${removedItem.productId._id}_${removedItem.variantId}`);
      }
      return {
        wishlist: newWishlist,
        wishlistItemIds: newWishlistItemIds,
        isLoading: true, // Still set isLoading for the API call
      };
    });

    try {
      const updatedWishlist = await wishlistApi.removeWishlistItem(itemId);
      // On success, update with the actual state from the backend
      set({
        wishlist: updatedWishlist,
        isLoading: false,
      });
      get()._updateWishlistItemIds(updatedWishlist.items); // Re-sync map with actual backend state
      toast.success("Item removed from wishlist.");
    } catch (error) {
      // On error, revert to the old state
      set({
        wishlist: oldWishlist,
        wishlistItemIds: oldWishlistItemIds,
        isLoading: false,
      });
      toast.error("Failed to remove item from wishlist.");
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
    set({ wishlist: null, isLoading: false, error: null, wishlistItemIds: new Map() }); // Clear derived state too
  },
}));