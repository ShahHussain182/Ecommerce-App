import axios from 'axios';
import { Order, ShippingAddress } from "@/types";

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

/**
 * Creates a new order from the user's current cart.
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await api.post('/orders', payload);
  return response.data.order;
};

/**
 * Fetches all orders for the authenticated user.
 */
export const fetchUserOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders');
  return response.data.orders;
};

/**
 * Fetches a single order by its ID.
 */
export const fetchOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.order;
};

/**
 * Updates the status of an order (e.g., for cancellation).
 */
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const response = await api.put(`/orders/${orderId}`, { status });
  return response.data.order;
};