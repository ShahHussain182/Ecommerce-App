"use client";

import { Link } from 'react-router-dom';
import { useUserOrders } from '@/hooks/useUserOrders';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Loader2, XCircle, ShoppingBag } from 'lucide-react';

const OrdersPage = () => {
  const { data: orders, isLoading, isError, error } = useUserOrders();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">My Orders</h1>
          <div className="max-w-3xl mx-auto space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load your orders. {error instanceof Error ? error.message : 'Unknown error.'}
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

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">No orders found</h2>
          <p className="text-gray-600 mb-8">It looks like you haven't placed any orders yet.</p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">My Orders</h1>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" /> Order #{order.orderNumber} {/* Display sequential order number */}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="font-medium text-lg">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-medium text-lg capitalize">{order.status}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold text-md mb-2">Items ({order.items.length})</h3>
                  <div className="space-y-2 max-h-24 overflow-y-auto pr-2">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex items-center gap-2 text-sm">
                        <img src={item.imageAtTime} alt={item.nameAtTime} className="w-8 h-8 object-cover rounded-sm" />
                        <span>{item.nameAtTime} ({item.sizeAtTime} / {item.colorAtTime}) x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <Button asChild variant="outline">
                    <Link to={`/order-confirmation/${order._id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;