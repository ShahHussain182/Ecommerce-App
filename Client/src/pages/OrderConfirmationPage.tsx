"use client";

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as orderApi from '@/lib/orderApi';
import { Order } from '@/types';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.fetchOrderById(orderId!),
    enabled: !!orderId,
    staleTime: Infinity, // Order details typically don't change
    gcTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      setOrder(data);
    }
  }, [data]);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-700 mb-8">
            Thank you for your purchase. Your order <span className="font-semibold">#{order._id.substring(0, 8)}</span> has been placed successfully.
          </p>

          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <Link to="/profile">View My Orders</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;