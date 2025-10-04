import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistApi from '@/lib/wishlistApi';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product, ProductVariant, Wishlist, WishlistItem } from '@/types';
import { toast } from 'sonner';

// Helper to create a temporary WishlistItem for optimistic updates
const createOptimisticWishlistItem = (product: Product, variant: ProductVariant, tempId: string): WishlistItem => ({
  _id: tempId,
  productId: product,
  variantId: variant._id,
  nameAtTime: product.name,
  imageAtTime: product.imageUrls[0] || '/placeholder.svg',
  priceAtTime: variant.price,
  sizeAtTime: variant.size,
  colorAtTime: variant.color,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// --- Add Item to Wishlist Mutation ---
export const useAddWishlistItemMutation = () => {
  const queryClient = useQueryClient();
  const { _updateWishlistItemIds, initializeWishlist } = useWishlistStore.getState();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      wishlistApi.addWishlistItem(productId, variantId),
    
    onMutate: async ({ productId, variantId }) => {
      // Cancel any outgoing refetches for the wishlist query
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous wishlist state from Zustand
      const previousWishlist = useWishlistStore.getState().wishlist;
      const previousWishlistItemIds = new Map(useWishlistStore.getState().wishlistItemIds);

      // Optimistically update Zustand state
      useWishlistStore.setState((state) => {
        const product = previousWishlist?.items.find(item => item.productId._id === productId)?.productId || {
          _id: productId,
          name: 'Unknown Product',
          imageUrls: [],
          description: '',
          category: '',
          variants: [],
          averageRating: 0,
          numberOfReviews: 0,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const variant = product.variants.find(v => v._id === variantId) || { _id: variantId, size: 'N/A', color: 'N/A', price: 0, stock: 0 };
        
        const tempId = `optimistic_${Date.now()}`;
        const optimisticItem = createOptimisticWishlistItem(product, variant, tempId);

        const currentItems = state.wishlist?.items || [];
        const newItems = [...currentItems, optimisticItem];
        const newWishlist = {
          ...(state.wishlist || { _id: 'temp', userId: 'temp', items: [], createdAt: '', updatedAt: '' }),
          items: newItems,
          totalItems: newItems.length,
        };
        const newWishlistItemIds = new Map(state.wishlistItemIds);
        newWishlistItemIds.set(`${productId}_${variantId}`, tempId);

        return {
          wishlist: newWishlist,
          wishlistItemIds: newWishlistItemIds,
          isLoading: true, // Indicate loading for the API call
        };
      });

      return { previousWishlist, previousWishlistItemIds };
    },

    onError: (err, variables, context) => {
      // Rollback to the previous state if the mutation fails
      if (context?.previousWishlist) {
        useWishlistStore.setState({
          wishlist: context.previousWishlist,
          wishlistItemIds: context.previousWishlistItemIds,
          isLoading: false,
        });
      }
      const errorMessage = (err as any).response?.data?.message || "Failed to add item to wishlist.";
      toast.error("Error", { description: errorMessage });
    },

    onSuccess: (updatedWishlist) => {
      // Update Zustand state with the actual data from the backend
      useWishlistStore.setState({
        wishlist: updatedWishlist,
        isLoading: false,
      });
      _updateWishlistItemIds(updatedWishlist.items); // Re-sync map with actual backend state
      toast.success(`${updatedWishlist.items.slice(-1)[0]?.nameAtTime || 'Item'} added to wishlist.`);
    },

    onSettled: () => {
      // Invalidate and refetch the wishlist query to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      initializeWishlist(); // Re-initialize Zustand store from backend
    },
  });
};

// --- Remove Item from Wishlist Mutation ---
export const useRemoveWishlistItemMutation = () => {
  const queryClient = useQueryClient();
  const { _updateWishlistItemIds, initializeWishlist } = useWishlistStore.getState();

  return useMutation({
    mutationFn: (itemId: string) => wishlistApi.removeWishlistItem(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      const previousWishlist = useWishlistStore.getState().wishlist;
      const previousWishlistItemIds = new Map(useWishlistStore.getState().wishlistItemIds);

      useWishlistStore.setState((state) => {
        const removedItem = state.wishlist?.items.find(item => item._id === itemId);
        const newItems = (state.wishlist?.items || []).filter(item => item._id !== itemId);
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
          isLoading: true,
        };
      });

      return { previousWishlist, previousWishlistItemIds };
    },

    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        useWishlistStore.setState({
          wishlist: context.previousWishlist,
          wishlistItemIds: context.previousWishlistItemIds,
          isLoading: false,
        });
      }
      toast.error("Failed to remove item from wishlist.");
    },

    onSuccess: (updatedWishlist) => {
      useWishlistStore.setState({
        wishlist: updatedWishlist,
        isLoading: false,
      });
      _updateWishlistItemIds(updatedWishlist.items);
      toast.success("Item removed from wishlist.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      initializeWishlist();
    },
  });
};

// --- Clear Wishlist Mutation ---
export const useClearWishlistMutation = () => {
  const queryClient = useQueryClient();
  const { _updateWishlistItemIds, initializeWishlist } = useWishlistStore.getState();

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      const previousWishlist = useWishlistStore.getState().wishlist;
      const previousWishlistItemIds = new Map(useWishlistStore.getState().wishlistItemIds);

      useWishlistStore.setState((state) => ({
        wishlist: {
          ...(state.wishlist || { _id: 'temp', userId: 'temp', items: [], createdAt: '', updatedAt: '' }),
          items: [],
          totalItems: 0,
        },
        wishlistItemIds: new Map(),
        isLoading: true,
      }));

      return { previousWishlist, previousWishlistItemIds };
    },

    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        useWishlistStore.setState({
          wishlist: context.previousWishlist,
          wishlistItemIds: context.previousWishlistItemIds,
          isLoading: false,
        });
      }
      toast.error("Failed to clear wishlist.");
    },

    onSuccess: (updatedWishlist) => {
      useWishlistStore.setState({
        wishlist: updatedWishlist,
        isLoading: false,
      });
      _updateWishlistItemIds(updatedWishlist.items);
      toast.success("Wishlist cleared.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      initializeWishlist();
    },
  });
};