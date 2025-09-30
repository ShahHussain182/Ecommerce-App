import { ShoppingCart, User, Search, Menu, Heart, Loader2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useAutocompleteSuggestions } from '@/hooks/useAutocompleteSuggestions'; // New import

export const Header = () => {
  const totalCartItems = useCartStore((state) => state.cart?.totalItems || 0);
  const totalWishlistItems = useWishlistStore((state) => state.wishlist?.totalItems || 0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);

  // New: Autocomplete suggestions hook
  const { data: suggestions, isLoading: isLoadingSuggestions } = useAutocompleteSuggestions(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchDialogOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion); // Set the search query to the suggestion
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setSearchQuery('');
    setIsSearchDialogOpen(false);
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
                {isLoadingSuggestions && searchQuery.length >= 2 && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading suggestions...
                  </div>
                )}
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <p className="text-sm font-semibold mb-1">Suggestions:</p>
                    <ul className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto py-1 px-2 text-sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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