import { api } from './api'; // Import the shared API instance
import { Cart, Product, ProductVariant } from "@/types";

/**
 * Fetches the user's cart from the backend.
 * The backend will create a cart if one doesn't exist.
 */
export const getCart = async (): Promise<Cart> => {
  const response = await api.get('/cart');
  return response.data.cart;
};

/**
 * Adds an item to the cart.
 */
export const addItem = async (product: Product, variant: ProductVariant, quantity: number): Promise<Cart> => {
  const response = await api.post('/cart/items', {
    productId: product._id,
    variantId: variant._id,
    quantity,
  });
  return response.data.cart;
};

/**
 * Updates the quantity of an item in the cart.
 */
export const updateItemQuantity = async (itemId: string, quantity: number): Promise<Cart> => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data.cart;
};

/**
 * Removes an item from the cart.
 */
export const removeItem = async (itemId: string): Promise<Cart> => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data.cart;
};

/**
 * Clears all items from the cart.
 */
export const clearCart = async (): Promise<Cart> => {
  const response = await api.delete('/cart');
  return response.data.cart;
};