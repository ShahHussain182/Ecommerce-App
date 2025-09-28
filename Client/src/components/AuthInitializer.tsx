import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from './ui/skeleton';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { setupApiInterceptors } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Import Loader2 for a better loading indicator

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout, isAuthenticated, user } = useAuthStore();
  const { initializeCart } = useCartStore();
  const { initializeWishlist } = useWishlistStore();
  const location = useLocation();

  const [isAuthAndDataLoaded, setIsAuthAndDataLoaded] = useState(false); // Combined loading state
  const hasSetupInterceptors = useRef(false);

  // Use TanStack Query for the initial auth check
  const { data, isLoading: isAuthQueryLoading, isError: isAuthQueryError } = useQuery({
    queryKey: ['authStatus', location.pathname],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/auth/check-auth', {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        throw error; 
      }
    },
    enabled: true,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!hasSetupInterceptors.current) {
      setupApiInterceptors(logout);
      hasSetupInterceptors.current = true;
    }
  }, [logout]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthQueryLoading) {
        if (data?.success && data.user) {
          console.log("[AuthInitializer] User authenticated:", data.user.userName);
          login(data.user, false); // Login without showing toast
          
          // Wait for both cart and wishlist to initialize
          await Promise.all([
            initializeCart(),
            initializeWishlist(),
          ]);
          console.log("[AuthInitializer] Cart and Wishlist initialized.");
        } else {
          console.log("[AuthInitializer] User not authenticated or check failed.");
          logout(); // Ensure logout if check fails
        }
        setIsAuthAndDataLoaded(true);
      }
    };

    loadUserData();
  }, [isAuthQueryLoading, data, isAuthQueryError, login, logout, initializeCart, initializeWishlist, location.pathname]);

  // If the initial check or data loading is still in progress, show a loading skeleton
  if (!isAuthAndDataLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-8 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-lg text-gray-700">Loading your session...</p>
        </main>
      </div>
    );
  }

  // After the initial check and data loading is finished, render children.
  // ProtectedRoute will then handle further redirection if isAuthenticated is false.
  return <>{children}</>;
};

export default AuthInitializer;