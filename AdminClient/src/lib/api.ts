import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If an API call is unauthorized, log the user out.
      useAuthStore.getState().logout();
      // The ProtectedRoute component will then redirect to /login
    }
    return Promise.reject(error);
  }
);

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
  adminOrders: '/orders/admin',
  orderMetrics: '/orders/metrics',
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