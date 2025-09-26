import { api } from '@/lib/api';
import { Order, ApiResponse } from '@/types';

export const orderService = {
  // Get all orders (Admin view - we'll mock this since backend only has user orders)
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    // Mock admin orders view since backend only has user-specific orders
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            _id: '1',
            userId: 'user1',
            orderNumber: 1001,
            items: [
              {
                _id: 'item1',
                productId: 'prod1',
                variantId: 'var1',
                quantity: 2,
                nameAtTime: 'Premium Headphones',
                imageAtTime: 'https://via.placeholder.com/100',
                priceAtTime: 199.99,
                sizeAtTime: 'One Size',
                colorAtTime: 'Black'
              }
            ],
            shippingAddress: {
              fullName: 'John Doe',
              addressLine1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postalCode: '10001',
              country: 'USA'
            },
            paymentMethod: 'Credit Card',
            totalAmount: 399.98,
            status: 'Processing',
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T11:00:00Z'
          },
          {
            _id: '2',
            userId: 'user2',
            orderNumber: 1002,
            items: [
              {
                _id: 'item2',
                productId: 'prod2',
                variantId: 'var2',
                quantity: 1,
                nameAtTime: 'Organic T-Shirt',
                imageAtTime: 'https://via.placeholder.com/100',
                priceAtTime: 29.99,
                sizeAtTime: 'M',
                colorAtTime: 'White'
              }
            ],
            shippingAddress: {
              fullName: 'Jane Smith',
              addressLine1: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90210',
              country: 'USA'
            },
            paymentMethod: 'PayPal',
            totalAmount: 29.99,
            status: 'Delivered',
            createdAt: '2024-01-19T14:30:00Z',
            updatedAt: '2024-01-20T09:15:00Z'
          },
          {
            _id: '3',
            userId: 'user3',
            orderNumber: 1003,
            items: [
              {
                _id: 'item3',
                productId: 'prod3',
                variantId: 'var3',
                quantity: 1,
                nameAtTime: 'Water Bottle',
                imageAtTime: 'https://via.placeholder.com/100',
                priceAtTime: 24.99,
                sizeAtTime: '500ml',
                colorAtTime: 'Silver'
              }
            ],
            shippingAddress: {
              fullName: 'Bob Johnson',
              addressLine1: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'USA'
            },
            paymentMethod: 'Credit Card',
            totalAmount: 24.99,
            status: 'Shipped',
            createdAt: '2024-01-18T16:45:00Z',
            updatedAt: '2024-01-19T08:30:00Z'
          },
          {
            _id: '4',
            userId: 'user4',
            orderNumber: 1004,
            items: [
              {
                _id: 'item4',
                productId: 'prod4',
                variantId: 'var4',
                quantity: 1,
                nameAtTime: 'Laptop Stand',
                imageAtTime: 'https://via.placeholder.com/100',
                priceAtTime: 79.99,
                sizeAtTime: 'Standard',
                colorAtTime: 'Aluminum'
              }
            ],
            shippingAddress: {
              fullName: 'Alice Brown',
              addressLine1: '321 Elm St',
              city: 'Miami',
              state: 'FL',
              postalCode: '33101',
              country: 'USA'
            },
            paymentMethod: 'Credit Card',
            totalAmount: 79.99,
            status: 'Pending',
            createdAt: '2024-01-21T12:20:00Z',
            updatedAt: '2024-01-21T12:20:00Z'
          }
        ];

        resolve({
          success: true,
          data: mockOrders,
          message: 'Orders retrieved successfully'
        });
      }, 1000);
    });
  },

  // Get single order by ID
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin function)
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    // Mock the admin order status update
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { _id: id, status } as any,
          message: 'Order status updated successfully'
        });
      }, 500);
    });
  },

  // Get order analytics/metrics (Admin function)
  async getOrderMetrics(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalOrders: 1250,
          ordersGrowth: 8.2,
          totalRevenue: 125000,
          revenueGrowth: 12.5,
          recentOrders: [
            { id: '#1234', customer: 'John Doe', amount: 299.99, status: 'Delivered', date: '2024-01-20' },
            { id: '#1235', customer: 'Jane Smith', amount: 159.50, status: 'Processing', date: '2024-01-20' },
            { id: '#1236', customer: 'Bob Johnson', amount: 89.99, status: 'Shipped', date: '2024-01-19' },
            { id: '#1237', customer: 'Alice Brown', amount: 199.99, status: 'Pending', date: '2024-01-19' },
            { id: '#1238', customer: 'Charlie Wilson', amount: 449.99, status: 'Delivered', date: '2024-01-18' },
          ]
        });
      }, 800);
    });
  }
};
