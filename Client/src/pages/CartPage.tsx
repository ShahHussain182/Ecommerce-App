"use client";

import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

const CartPage = () => {
  const { items, removeItem, updateItemQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
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
              <Card key={item.cartItemId} className="flex flex-col sm:flex-row items-center p-4">
                <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                  <img
                    src={item.product.imageUrls[0]}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                </Link>
                <div className="flex-grow mt-4 sm:mt-0">
                  <Link to={`/product/${item.product.id}`}>
                    <CardTitle className="text-lg font-semibold hover:text-primary">{item.product.name}</CardTitle>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {item.variant.size !== "One Size" && `Size: ${item.variant.size}, `}
                    Color: {item.variant.color}
                  </p>
                  <p className="text-md font-medium mt-1">${item.variant.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0 sm:ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateItemQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
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
                    onClick={() => updateItemQuantity(item.cartItemId, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.cartItemId)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
                <div className="text-lg font-semibold mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto text-right">
                  ${(item.variant.price * item.quantity).toFixed(2)}
                </div>
              </Card>
            ))}
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-700">Subtotal ({items.length} items)</p>
                  <p className="font-semibold">${subtotal.toFixed(2)}</p>
                </div>
                {/* Add more summary details like shipping, taxes later */}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <p>Total</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
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