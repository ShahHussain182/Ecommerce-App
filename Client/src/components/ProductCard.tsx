"use client";

import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Star } from 'lucide-react'; // Import Star icon
import { cn } from '@/lib/utils';
import React from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAddWishlistItemMutation, useRemoveWishlistItemMutation } from '@/hooks/useWishlistMutations';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItemToCart = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  
  // Safely get the first variant, which will always exist due to backend logic
  const defaultVariant = product.variants[0]; 

  const addWishlistItemMutation = useAddWishlistItemMutation();
  const removeWishlistItemMutation = useRemoveWishlistItemMutation();
  
  const wishlistItemIdsMap = useWishlistStore((state) => state.wishlistItemIds);

  const wishlistItemId = React.useMemo(() => {
    if (!defaultVariant) return undefined; // Should not happen with new backend logic
    return wishlistItemIdsMap.get(`${product._id}_${defaultVariant._id}`);
  }, [wishlistItemIdsMap, product._id, defaultVariant]);

  const isInWishlist = !!wishlistItemId;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }

    if (defaultVariant) { // defaultVariant will always exist now
      addItemToCart(product, defaultVariant, 1);
    } else {
      toast.error("Product variant information missing."); // Fallback, should not be hit
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    if (defaultVariant) { // defaultVariant will always exist now
      if (isInWishlist && wishlistItemId) {
        removeWishlistItemMutation.mutate(wishlistItemId);
      } else {
        addWishlistItemMutation.mutate({ productId: product._id, variantId: defaultVariant._id });
      }
    } else {
      toast.error("Product variant information missing."); // Fallback, should not be hit
    }
  };

  const isWishlistActionPending = addWishlistItemMutation.isPending || removeWishlistItemMutation.isPending;

  return (
    <Card className="overflow-hidden flex flex-col relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 z-10 rounded-full bg-white/80 hover:bg-white",
          isInWishlist ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
        )}
        onClick={handleToggleWishlist}
        disabled={!isAuthenticated || isWishlistActionPending || !defaultVariant}
      >
        <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500")} />
      </Button>
      <Link to={`/product/${product._id}`} className="flex-grow flex flex-col">
        <CardHeader className="p-0">
          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 hover:text-primary">{product.name}</CardTitle>
          <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden text-ellipsis">
            {product.description}
          </p>
          {product.numberOfReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.numberOfReviews})</span>
            </div>
          )}
          <p className="text-xl font-bold text-gray-900">
            {defaultVariant ? `$${defaultVariant.price.toFixed(2)}` : 'N/A'}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          className="w-full" 
          onClick={handleAddToCart} 
          disabled={!defaultVariant || defaultVariant.stock === 0}
        >
          {defaultVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};