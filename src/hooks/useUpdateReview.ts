import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductReview } from '@/lib/reviewApi';
import { UpdateReviewPayload } from '@/types';
import { toast } from 'sonner';

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      updateProductReview(reviewId, payload),
    onSuccess: (updatedReview) => {
      toast.success("Review Updated!", {
        description: "Your review has been successfully updated.",
      });
      // Invalidate queries to refetch product details (for updated average rating if rating changed)
      queryClient.invalidateQueries({ queryKey: ['product', updatedReview.productId] });
      // Invalidate queries to refetch product reviews
      queryClient.invalidateQueries({ queryKey: ['productReviews', updatedReview.productId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update review. Please try again.";
      toast.error("Review Update Failed", {
        description: errorMessage,
      });
    },
  });
};