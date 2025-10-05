"use client";

import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Star, Loader2 } from 'lucide-react'; // Import Loader2 icon
import { cn } from '@/lib/utils';
import React from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAddWishlistItemMutation, useRemoveWishlistItemMutation } from '@/hooks/useWishlistMutations';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItemToCart = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  
  const defaultVariant = product.variants[0]; 

  const addWishlistItemMutation = useAddWishlistItemMutation();
  const removeWishlistItemMutation = useRemoveWishlistItemMutation();
  
  const wishlistItemIdsMap = useWishlistStore((state) => state.wishlistItemIds);

  const wishlistItemId = React.useMemo(() => {
    if (!defaultVariant) return undefined;
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

    // This check is technically redundant if backend filters by 'completed',
    // but good for client-side feedback if a 'pending' product somehow appears.
    if (product.imageProcessingStatus === 'pending') {
      toast.info("Images are still being processed. Please try again shortly.");
      return;
    }

    if (defaultVariant) {
      addItemToCart(product, defaultVariant, 1);
    } else {
      toast.error("Product variant information missing.");
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    // This check is technically redundant if backend filters by 'completed',
    // but good for client-side feedback if a 'pending' product somehow appears.
    if (product.imageProcessingStatus === 'pending') {
      toast.info("Images are still being processed. Please try again shortly.");
      return;
    }

    if (defaultVariant) {
      if (isInWishlist && wishlistItemId) {
        removeWishlistItemMutation.mutate(wishlistItemId);
      } else {
        addWishlistItemMutation.mutate({ productId: product._id, variantId: defaultVariant._id });
      }
    } else {
      toast.error("Product variant information missing.");
    }
  };

  const isWishlistActionPending = addWishlistItemMutation.isPending || removeWishlistItemMutation.isPending;
  const isImageProcessingPending = product.imageProcessingStatus === 'pending';
  
  // Use the medium rendition for the product card display
  const displayImageUrl = product.imageRenditions[0]?.medium || product.imageUrls[0] || '/placeholder.svg';

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden flex flex-col relative rounded-lg border border-gray-200 dark:border-gray-700 bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-300"
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 z-10 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200",
          isInWishlist ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
        )}
        onClick={handleToggleWishlist}
        disabled={!isAuthenticated || isWishlistActionPending || !defaultVariant || isImageProcessingPending}
      >
        <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500")} />
      </Button>
      <Link to={`/product/${product._id}`} className="flex-grow flex flex-col">
        <CardHeader className="p-0 relative">
          {isImageProcessingPending ? (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-t-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">Image processing...</span>
            </div>
          ) : (
            <img 
              src={displayImageUrl} 
              alt={product.name} 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 hover:text-primary transition-colors duration-200">{product.name}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 h-10 overflow-hidden text-ellipsis">
            {product.description}
          </p>
          {product.numberOfReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">({product.numberOfReviews})</span>
            </div>
          )}
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {defaultVariant ? `$${defaultVariant.price.toFixed(2)}` : 'N/A'}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200" 
          onClick={handleAddToCart} 
          disabled={!defaultVariant || defaultVariant.stock === 0 || isImageProcessingPending}
        >
          {isImageProcessingPending ? 'Processing Images...' : (defaultVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
        </Button>
      </CardFooter>
    </motion.div>
  );
};