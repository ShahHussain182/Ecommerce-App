import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore'; // Import wishlist store
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Heart } from 'lucide-react'; // Import Heart icon
import { cn } from '@/lib/utils'; // Import cn for conditional styling

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItemToCart = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const defaultVariant = product.variants[0];

  const addItemToWishlist = useWishlistStore((state) => state.addItemToWishlist);
  const removeItemFromWishlist = useWishlistStore((state) => state.removeItemFromWishlist);
  const isItemInWishlist = useWishlistStore((state) => state.isItemInWishlist);
  const wishlistItems = useWishlistStore((state) => state.wishlist?.items || []);

  const isInWishlist = defaultVariant ? isItemInWishlist(product._id, defaultVariant._id) : false;
  const wishlistItemId = isInWishlist 
    ? wishlistItems.find(item => item.productId._id === product._id && item.variantId === defaultVariant?._id)?._id 
    : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when button is clicked

    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }

    if (defaultVariant) {
      addItemToCart(product, defaultVariant, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    if (defaultVariant) {
      if (isInWishlist && wishlistItemId) {
        removeItemFromWishlist(wishlistItemId);
      } else {
        addItemToWishlist(product, defaultVariant);
      }
    }
  };

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
        disabled={!isAuthenticated}
      >
        <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500")} />
      </Button>
      <Link to={`/product/${product._id}`} className="flex-grow flex flex-col">
        <CardHeader className="p-0">
          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 hover:text-primary">{product.name}</CardTitle>
          <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">
            {product.description}
          </p>
          <p className="text-xl font-bold text-gray-900">${defaultVariant?.price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" onClick={handleAddToCart} disabled={!defaultVariant || defaultVariant.stock === 0}>
          {defaultVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};