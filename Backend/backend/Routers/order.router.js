import express from 'express';
import { requireAuth } from '../Middleware/requireAuth.js';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../Controllers/order.controller.js';

const orderRouter = express.Router();

// All order routes require authentication
orderRouter.use(requireAuth);

orderRouter.route('/')
  .post(createOrder) // Create a new order
  .get(getUserOrders); // Get all orders for the authenticated user

orderRouter.route('/:id')
  .get(getOrderById) // Get a specific order by ID
  .put(updateOrderStatus); // Update order status (e.g., cancel)

export default orderRouter;