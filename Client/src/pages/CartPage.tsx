"use client";

import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';

const CartPage = () => {
  const { cart, removeItem, updateItemQuantity, clearRemoteCart, isLoading } = useCartStore();
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <Card key={item._id} className="flex flex-col sm:flex-row items-center p-4">
                <Link to={`/product/${item.productId._id}`} className="flex-shrink-0">
                  <img
                    src={item.imageAtTime}
                    alt={item.nameAtTime}
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                </Link>
                <div className="flex-grow mt-4 sm:mt-0">
                  <Link to={`/product/${item.productId._id}`}>
                    <CardTitle className="text-lg font-semibold hover:text-primary">{item.nameAtTime}</CardTitle>
                  </Link>
                  <p className="text-md font-medium mt-1">${item.priceAtTime.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0 sm:ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    readOnly
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item._id)} disabled={isLoading}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
                <div className="text-lg font-semibold mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto text-right">
                  ${(item.priceAtTime * item.quantity).toFixed(2)}
                </div>
              </Card>
            ))}
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearRemoteCart} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-700">Subtotal ({cart?.totalItems || 0} items)</p>
                  <p className="font-semibold">${cart?.subtotal.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <p>Total</p>
                  <p>${cart?.subtotal.toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;