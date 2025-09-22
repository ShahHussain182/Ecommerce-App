import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProductReview } from '@/lib/reviewApi';
import { toast } from 'sonner';

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteProductReview(reviewId),
    onSuccess: (_, reviewIdToDelete) => {
      toast.success("Review Deleted!", {
        description: "Your review has been successfully removed.",
      });
      // Find the product ID associated with the deleted review to invalidate correctly
      const queryData = queryClient.getQueryData(['productReviews', undefined]) as any; // This might need refinement
      const productId = queryData?.pages?.[0]?.reviews?.find((r: any) => r._id === reviewIdToDelete)?.productId;

      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
      } else {
        // Fallback if productId can't be directly inferred from cache
        queryClient.invalidateQueries({ queryKey: ['productReviews'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete review. Please try again.";
      toast.error("Review Deletion Failed", {
        description: errorMessage,
      });
    },
  });
};