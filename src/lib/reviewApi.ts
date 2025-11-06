import axios from 'axios';
import { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types";

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

interface PaginatedReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  nextPage: number | null;
}

/**
 * Submits a new review for a product.
 */
export const createProductReview = async (payload: CreateReviewPayload): Promise<Review> => {
  const response = await api.post('/reviews', payload);
  return response.data.review;
};

/**
 * Fetches reviews for a specific product.
 */
export const fetchProductReviews = async (productId: string, pageParam: number = 1, limit: number = 10): Promise<PaginatedReviewsResponse> => {
  const response = await api.get(`/reviews/product/${productId}`, {
    params: { page: pageParam, limit },
  });
  return response.data;
};

/**
 * Updates an existing review.
 */
export const updateProductReview = async (reviewId: string, payload: UpdateReviewPayload): Promise<Review> => {
  const response = await api.put(`/reviews/${reviewId}`, payload);
  return response.data.review;
};

/**
 * Deletes an existing review.
 */
export const deleteProductReview = async (reviewId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};