import axios from 'axios';
import { User } from '@/types'; // Keep User type for potential future use in API responses

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set up interceptors, to be called after authStore is initialized
export const setupApiInterceptors = (logoutFn: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log("Axios Interceptor: Error caught", error.response); // Add this line
      if (error.response?.status === 401) {
        console.log("Axios Interceptor: 401 Unauthorized, calling logoutFn"); // Add this line
        logoutFn();
      }
      return Promise.reject(error);
    }
  );
};

// API endpoints (keeping this for reference, but services are preferred)
export const endpoints = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  profile: '/auth/profile',
  
  // Products
  products: '/products',
  productById: (id: string) => `/products/${id}`,
  
  // Orders
  orders: '/orders',
  orderById: (id: string) => `/orders/${id}`,
  updateOrderStatus: (id: string) => `/orders/${id}/status`,
  
  // Cart
  cart: '/cart',
  
  // Reviews
  reviews: '/reviews',
  productReviews: (productId: string) => `/reviews/product/${productId}`,
  
  // Wishlist
  wishlist: '/wishlist',
} as const;