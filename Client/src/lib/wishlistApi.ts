import axios from 'axios';
import { Wishlist, Product, ProductVariant } from "@/types";

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Fetches the user's wishlist from the backend.
 * The backend will create a wishlist if one doesn't exist.
 */
export const getWishlist = async (): Promise<Wishlist> => {
  const response = await api.get('/wishlist');
  return response.data.wishlist;
};

/**
 * Adds an item to the wishlist.
 */
export const addWishlistItem = async (productId: string, variantId: string): Promise<Wishlist> => {
  const response = await api.post('/wishlist/items', {
    productId,
    variantId,
  });
  return response.data.wishlist;
};

/**
 * Removes an item from the wishlist.
 */
export const removeWishlistItem = async (itemId: string): Promise<Wishlist> => {
  const response = await api.delete(`/wishlist/items/${itemId}`);
  return response.data.wishlist;
};

/**
 * Clears all items from the wishlist.
 */
export const clearWishlist = async (): Promise<Wishlist> => {
  const response = await api.delete('/wishlist');
  return response.data.wishlist;
};