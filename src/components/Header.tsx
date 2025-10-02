"use client";

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
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import React from 'react';
import { cn } from '@/lib/utils';
import { useAutocompleteSuggestions } from '@/hooks/useAutocompleteSuggestions';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'; // Import motion and hooks

export const Header = () => {
  const totalCartItems = useCartStore((state) => state.cart?.totalItems || 0);
  const totalWishlistItems = useWishlistStore((state) => state.wishlist?.totalItems || 0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false); // New state for scroll

  const { scrollY } = useScroll(); // Hook to track scroll position

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 0 && !isScrolled) {
      setIsScrolled(true);
    } else if (latest === 0 && isScrolled) {
      setIsScrolled(false);
    }
  });

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
      {/* Home Link */}
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Link 
          to="/" 
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            location.pathname === "/" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
          )}
        >
          Home
        </Link>
      </motion.div>
      {/* Shop Link */}
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Link 
          to="/products" 
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            location.pathname.startsWith("/products") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
          )}
        >
          Shop
        </Link>
      </motion.div>
      {/* About Link */}
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Link 
          to="/about" 
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            location.pathname === "/about" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
          )}
        >
          About
        </Link>
      </motion.div>
      {/* Contact Link */}
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Link 
          to="/contact" 
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            location.pathname === "/contact" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
          )}
        >
          Contact
        </Link>
      </motion.div>
    </>
  );

  return (
    <motion.header
      className="bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      animate={{
        boxShadow: isScrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
        borderColor: isScrolled ? "hsl(var(--border))" : "hsl(var(--border))", // Keep border visible
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-gray-50">E-Store</Link>
          </div>
          
          {!isMobile && (
            <nav className="hidden md:flex md:items-center md:space-x-1"> {/* Adjusted space-x for better fit */}
              {navLinks}
            </nav>
          )}

          <div className="flex items-center space-x-2"> {/* Adjusted space-x for icons */}
            <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50">
                  <Search className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card dark:bg-card text-card-foreground">
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
                    className="col-span-3 bg-input dark:bg-input text-foreground dark:text-foreground"
                    aria-label="Product search input"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Search</Button>
                </form>
                {isLoadingSuggestions && searchQuery.length >= 2 && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading suggestions...
                  </div>
                )}
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-2 border-t border-border pt-2">
                    <p className="text-sm font-semibold mb-1 text-foreground">Suggestions:</p>
                    <ul className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto py-1 px-2 text-sm text-muted-foreground hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
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

            <Button variant="ghost" size="icon" asChild aria-label="Wishlist" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50">
              <Link to="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                    {totalWishlistItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild aria-label={isAuthenticated ? "Profile" : "Login"} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50">
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Shopping Cart" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50">
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
                  <Button variant="ghost" size="icon" aria-label="Open navigation menu" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card dark:bg-card text-card-foreground">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navLinks}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};