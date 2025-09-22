"use client";

import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HeartCrack, Loader2, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useRemoveWishlistItemMutation, useClearWishlistMutation } from '@/hooks/useWishlistMutations';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { wishlist, isLoading } = useWishlistStore(); // Removed removeItemFromWishlist, clearRemoteWishlist
  const addItemToCart = useCartStore((state) => state.addItem);
  const items = wishlist?.items || [];

  const removeWishlistItemMutation = useRemoveWishlistItemMutation();
  const clearWishlistMutation = useClearWishlistMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", { description: "Please log in to view your wishlist." });
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = async (product: any, variant: any) => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }
    await addItemToCart(product, variant, 1);
    // Optionally remove from wishlist after adding to cart
    const wishlistItemId = items.find(item => item.productId._id === product._id && item.variantId === variant._id)?._id;
    if (wishlistItemId) {
      removeWishlistItemMutation.mutate(wishlistItemId);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-lg text-gray-700">Loading wishlist...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <HeartCrack className="h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your wishlist yet.</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isAnyWishlistMutationPending = removeWishlistItemMutation.isPending || clearWishlistMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">My Wishlist</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const product = item.productId;
              const variant = product.variants.find(v => v._id === item.variantId);
              const isOutOfStock = variant ? variant.stock === 0 : true;
              const priceChanged = variant && item.priceAtTime !== variant.price;

              return (
                <Card key={item._id} className="flex flex-col sm:flex-row items-center p-4">
                  <Link to={`/product/${product._id}`} className="flex-shrink-0">
                    <img
                      src={item.imageAtTime}
                      alt={item.nameAtTime}
                      className="w-24 h-24 object-cover rounded-md mr-4"
                    />
                  </Link>
                  <div className="flex-grow mt-4 sm:mt-0">
                    <Link to={`/product/${product._id}`}>
                      <CardTitle className="text-lg font-semibold hover:text-primary">{item.nameAtTime}</CardTitle>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {item.sizeAtTime} / {item.colorAtTime}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-md font-medium">${item.priceAtTime.toFixed(2)}</p>
                      {priceChanged && (
                        <span className="text-sm text-red-500 line-through">${variant?.price.toFixed(2)}</span>
                      )}
                    </div>
                    {isOutOfStock && (
                      <p className="text-sm text-red-500 font-semibold mt-1">Out of Stock</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0 sm:ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product, variant)}
                      disabled={isOutOfStock || isAnyWishlistMutationPending}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeWishlistItemMutation.mutate(item._id)} disabled={isAnyWishlistMutationPending}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => clearWishlistMutation.mutate()} disabled={isAnyWishlistMutationPending}>
                {isAnyWishlistMutationPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Clear Wishlist
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-700">Total Items</p>
                  <p className="font-semibold">{wishlist?.totalItems || 0}</p>
                </div>
                <Separator />
                <p className="text-sm text-gray-500">
                  Items in your wishlist are saved for later. Prices and availability may change.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" size="lg">
                  <Link to="/products">Continue Shopping</Link>
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

export default WishlistPage;