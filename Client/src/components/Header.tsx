import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react'; // Import Heart icon
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { shallow } from 'zustand/shallow'; // Import shallow

export const Header = () => {
  // Use selectors with shallow comparison for cart and wishlist
  const { totalCartItems } = useCartStore(
    (state) => ({ totalCartItems: state.cart?.totalItems || 0 }),
    shallow
  );
  const { totalWishlistItems } = useWishlistStore(
    (state) => ({ totalWishlistItems: state.wishlist?.totalItems || 0 }),
    shallow
  );
  
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchDialogOpen(false);
    }
  };

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium text-gray-700 hover:text-black">Home</Link>
      <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-black">Shop</Link>
      <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-black">About</Link>
      <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-black">Contact</Link>
    </>
  );

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">E-Store</Link>
          </div>
          
          {!isMobile && (
            <nav className="hidden md:flex md:items-center md:space-x-6">
              {navLinks}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Search Products</DialogTitle>
                  <DialogDescription>
                    Find your next favorite item.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSearchSubmit} className="grid gap-4 py-4">
                  <Input
                    id="search"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="col-span-3"
                  />
                  <Button type="submit">Search</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                    {totalWishlistItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalCartItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                    {totalCartItems}
                  </Badge>
                )}
              </Link>
            </Button>
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navLinks}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};