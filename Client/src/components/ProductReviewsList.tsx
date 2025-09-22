"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, UserCircle, Loader2, Edit, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useUpdateReview } from '@/hooks/useUpdateReview';
import { useDeleteReview } from '@/hooks/useDeleteReview';
import { Review as ReviewType, UpdateReviewPayload } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductReviewsListProps {
  productId: string;
  averageRating: number;
  numberOfReviews: number;
}

const editReviewFormSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating.").max(5, "Rating cannot exceed 5 stars.").optional(),
  title: z.string().max(100, "Title cannot exceed 100 characters.").optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment cannot exceed 1000 characters.").optional(),
});

type EditReviewFormValues = z.infer<typeof editReviewFormSchema>;

export const ProductReviewsList = ({ productId, averageRating, numberOfReviews }: ProductReviewsListProps) => {
  const { user } = useAuthStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useProductReviews(productId);
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  const reviews = data?.pages.flatMap(page => page.reviews) || [];

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const form = useForm<EditReviewFormValues>({
    resolver: zodResolver(editReviewFormSchema),
  });

  const handleEditClick = (review: ReviewType) => {
    setEditingReviewId(review._id);
    form.reset({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    form.reset();
  };

  const handleRatingClick = (ratingValue: number) => {
    form.setValue('rating', ratingValue, { shouldValidate: true });
    form.clearErrors('rating');
  };

  const onEditSubmit = async (values: EditReviewFormValues) => {
    if (!editingReviewId) return;

    const payload: UpdateReviewPayload = {
      rating: values.rating,
      title: values.title || undefined,
      comment: values.comment,
    };

    updateReviewMutation.mutate({ reviewId: editingReviewId, payload }, {
      onSuccess: () => {
        setEditingReviewId(null);
      },
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </Card>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Error loading reviews: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle className="text-2xl font-bold mb-2">Customer Reviews</CardTitle>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-6 w-6",
                  i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-600">({numberOfReviews} reviews)</span>
        </div>
        <Separator />
        {reviews.length === 0 && (
          <p className="text-gray-600 mt-4">No reviews yet. Be the first to review this product!</p>
        )}
        <div className="mt-6 space-y-6">
          {reviews.map((review) => (
            <Card key={review._id} className="p-4">
              {editingReviewId === review._id ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Your Rating</FormLabel>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <Star
                                key={starValue}
                                className={cn(
                                  "h-6 w-6 cursor-pointer transition-colors",
                                  (hoveredRating >= starValue || form.watch('rating') >= starValue)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                                onMouseEnter={() => setHoveredRating(starValue)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => handleRatingClick(starValue)}
                              />
                            ))}
                          </div>
                          <FormErrorMessage message={error?.message} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Review Title (Optional)</FormLabel>
                          <Input {...field} />
                          <FormErrorMessage message={error?.message} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Your Comment</FormLabel>
                          <Textarea rows={4} {...field} />
                          <FormErrorMessage message={error?.message} />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateReviewMutation.isPending}>
                        {updateReviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={updateReviewMutation.isPending}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-6 w-6 text-gray-500" />
                      <p className="font-semibold text-lg">{review.userId.userName}</p>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {user?._id === review.userId._id && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your review.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReview(review._id)} disabled={deleteReviewMutation.isPending}>
                                {deleteReviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  {review.title && <h3 className="font-medium text-lg mb-1">{review.title}</h3>}
                  <p className="text-gray-700">{review.comment}</p>
                </>
              )}
            </Card>
          ))}
        </div>
        <div ref={loadMoreRef} className="mt-6 text-center">
          {hasNextPage && (
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading more...
                </>
              ) : (
                "Load More Reviews"
              )}
            </Button>
          )}
          {!hasNextPage && reviews.length > 0 && (
            <p className="text-gray-500">You've reached the end of the reviews.</p>
          )}
        </div>
      </Card>
    </div>
  );
};