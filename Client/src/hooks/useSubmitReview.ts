import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductReview } from '@/lib/reviewApi';
import { CreateReviewPayload } from '@/types';
import { toast } from 'sonner';

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createProductReview(payload),
    onSuccess: (newReview) => {
      toast.success("Review Submitted!", {
        description: "Thank you for your feedback!",
      });
      // Invalidate queries to refetch product details (for updated average rating)
      queryClient.invalidateQueries({ queryKey: ['product', newReview.productId] });
      // Invalidate queries to refetch product reviews
      queryClient.invalidateQueries({ queryKey: ['productReviews', newReview.productId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error("Review Submission Failed", {
        description: errorMessage,
      });
    },
  });
};