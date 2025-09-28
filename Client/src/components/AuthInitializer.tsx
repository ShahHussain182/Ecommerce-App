import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from './ui/skeleton';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { setupApiInterceptors } from '@/lib/api'; // Import the setup function
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { useLocation } from 'react-router-dom'; // Import useLocation

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout, isAuthenticated, user } = useAuthStore();
  const { initializeCart } = useCartStore();
  const { initializeWishlist } = useWishlistStore();
  const { mutateAsync: refreshTokens } = useRefreshToken();
  const location = useLocation(); // Initialize useLocation

  const [isAuthCheckFinished, setIsAuthCheckFinished] = useState(false); // Renamed for clarity
  const hasSetupInterceptors = useRef(false);

  // Use TanStack Query for the initial auth check
  const { data, isLoading: isAuthQueryLoading, isError: isAuthQueryError, refetch } = useQuery({
    queryKey: ['authStatus', location.pathname], // Include location.pathname to re-run on route change
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/auth/check-auth', {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        // If check-auth fails, it means the user is not authenticated or token is invalid/expired
        // We don't re-throw here, just let isAuthQueryError become true
        throw error; 
      }
    },
    enabled: true, // Always run on mount and on queryKey change
    retry: false, // Do not retry failed auth checks
    staleTime: 0, // Always consider this query stale, so it refetches on mount/queryKey change
    gcTime: 0, // Don't keep this data in cache
  });

  useEffect(() => {
    if (!hasSetupInterceptors.current) {
      setupApiInterceptors(logout);
      hasSetupInterceptors.current = true;
    }
  }, [logout]);

  useEffect(() => {
    console.log("[AuthInitializer] Auth Query State:", { isAuthQueryLoading, isAuthQueryError, data, path: location.pathname });

    if (!isAuthQueryLoading) {
      if (data?.success && data.user) {
        console.log("[AuthInitializer] User authenticated:", data.user.userName);
        login(data.user, false); // Login without showing toast
        initializeCart();
        initializeWishlist();
      } else {
        console.log("[AuthInitializer] User not authenticated or check failed.");
        logout(); // Ensure logout if check fails
      }
      setIsAuthCheckFinished(true);
    }
  }, [isAuthQueryLoading, isAuthQueryError, data, login, logout, initializeCart, initializeWishlist, location.pathname]);

  // If the initial check is still loading, show a loading skeleton
  if (!isAuthCheckFinished) {
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
        <main className="flex-grow container mx-auto p-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  // After the initial check is finished, render children.
  // ProtectedRoute will then handle further redirection if isAuthenticated is false.
  return <>{children}</>;
};

export default AuthInitializer;