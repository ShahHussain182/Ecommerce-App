"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Loader2, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { CreateReviewPayload } from '@/types';
import { useProductReviews } from '@/hooks/useProductReviews'; // Import useProductReviews
import { Link } from 'react-router-dom';

interface ProductReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

const reviewFormSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating.").max(5, "Rating cannot exceed 5 stars."),
  title: z.string().max(100, "Title cannot exceed 100 characters.").optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment cannot exceed 1000 characters."),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const ProductReviewForm = ({ productId, onReviewSubmitted }: ProductReviewFormProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const submitReviewMutation = useSubmitReview();
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch reviews to check if the current user has already reviewed
  const { data: reviewsData, isLoading: isLoadingReviews } = useProductReviews(productId);
  const allReviews = reviewsData?.pages.flatMap(page => page.reviews) || [];
  const hasUserReviewed = user && allReviews.some(review => review.userId._id === user._id);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const { clearErrors, setValue, watch } = form;
  const currentRating = watch('rating');

  const handleRatingClick = (ratingValue: number) => {
    setValue('rating', ratingValue, { shouldValidate: true });
    clearErrors('rating');
  };

  const onSubmit = async (values: ReviewFormValues) => {
    if (!isAuthenticated || !user) {
      return;
    }

    const payload: CreateReviewPayload = {
      productId,
      rating: values.rating,
      title: values.title || undefined,
      comment: values.comment,
    };

    submitReviewMutation.mutate(payload, {
      onSuccess: () => {
        form.reset({ rating: 0, title: "", comment: "" });
        onReviewSubmitted?.();
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="mb-6 p-6 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl font-semibold">Leave a Review</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-gray-600">Please <Link to="/login" className="text-primary underline font-medium">log in</Link> to leave a review.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingReviews) {
    return (
      <Card className="mb-6 p-6 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl font-semibold">Leave a Review</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking your review status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasUserReviewed) {
    return (
      <Card className="mb-6 p-6 shadow-sm bg-green-50 border-green-200">
        <CardContent className="p-0 flex items-center gap-3 text-green-700">
          <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
          <p className="font-medium">You have already submitted a review for this product. You can edit your existing review below.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-6 shadow-sm">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-semibold">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel className="text-base">Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                          key={starValue}
                          className={cn(
                            "h-7 w-7 cursor-pointer transition-colors",
                            (hoveredRating >= starValue || currentRating >= starValue)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => handleRatingClick(starValue)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel className="text-base">Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Great product!" {...field} />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel className="text-base">Your Comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us what you think..." rows={4} {...field} />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitReviewMutation.isPending}>
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};