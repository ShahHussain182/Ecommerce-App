"use client";

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import useMutation and useQueryClient
import * as orderApi from '@/lib/orderApi';
import { Order } from '@/types';
import { toast } from 'sonner'; // Import toast for notifications

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, XCircle, Ban } from 'lucide-react'; // Import Ban icon
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize query client

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.fetchOrderById(orderId!),
    enabled: !!orderId,
    staleTime: Infinity, // Order details typically don't change
    gcTime: Infinity,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => orderApi.updateOrderStatus(id, 'Cancelled'),
    onSuccess: (updatedOrder) => {
      toast.success("Order Cancelled", {
        description: `Order #${updatedOrder.orderNumber} has been successfully cancelled.`,
      });
      
      // Immediately update the specific order in the cache
      queryClient.setQueryData(['order', orderId], updatedOrder);

      // Immediately update the list of user orders in the cache
      queryClient.setQueryData(['userOrders'], (oldOrders: Order[] | undefined) => {
        if (!oldOrders) return oldOrders;
        return oldOrders.map((order: Order) => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
      });

      // Invalidate queries to ensure they refetch if they become stale later,
      // but the UI should already be updated by setQueryData.
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Failed to cancel order. Please try again.";
      toast.error("Cancellation Failed", { description: errorMessage });
      console.error("Order cancellation error:", err);
    },
  });

  const order = data; // Use data directly from useQuery

  if (!orderId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Invalid Order</AlertTitle>
            <AlertDescription>No order ID provided. Please navigate from a completed checkout.</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-lg text-gray-700">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Order Not Found</AlertTitle>
            <AlertDescription>
              Failed to load order details. {error instanceof Error ? error.message : 'Unknown error.'}
              <Button variant="link" asChild className="p-0 h-auto ml-2">
                <Link to="/">Return to Home</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const canCancel = order.status === 'Pending';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {order.status === 'Cancelled' ? (
            <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
          ) : (
            <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
          )}
          <h1 className="text-4xl font-bold mb-4">
            {order.status === 'Cancelled' ? 'Order Cancelled' : 'Order Confirmed!'}
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            {order.status === 'Cancelled'
              ? `Your order #${order.orderNumber} has been cancelled.`
              : `Thank you for your purchase. Your order #${order.orderNumber} has been placed successfully.`}
          </p>

          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Status</h3>
                <p className="capitalize text-xl font-bold">{order.status}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                <p className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <img src={item.imageAtTime} alt={item.nameAtTime} className="w-10 h-10 object-cover rounded-md" />
                        <span>{item.nameAtTime} ({item.sizeAtTime} / {item.colorAtTime}) x {item.quantity}</span>
                      </div>
                      <span>${(item.priceAtTime * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold">
                <span>Total Amount</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/products">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/orders">View My Orders</Link>
            </Button>
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" disabled={cancelOrderMutation.isPending}>
                    {cancelOrderMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="mr-2 h-4 w-4" />
                    )}
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently cancel your order.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep order</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelOrderMutation.mutate(orderId!)}>
                      Yes, cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;