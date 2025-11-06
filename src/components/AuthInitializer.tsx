import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from './ui/skeleton';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { setupApiInterceptors } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Import Loader2 for a better loading indicator
import { useNavigate } from 'react-router-dom';
import * as authApi from '@/lib/authApi';
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout, isAuthenticated, user, signupInProgress } = useAuthStore(); // Get signupInProgress
  const { initializeCart } = useCartStore();
  const { initializeWishlist } = useWishlistStore();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  const [isAuthAndDataLoaded, setIsAuthAndDataLoaded] = useState(false); // Combined loading state
  const hasSetupInterceptors = useRef(false);
  const refreshingRef = useRef(false);
  const refreshToken = useRefreshToken();
  // Use TanStack Query for the initial auth check
  const { data, isLoading: isAuthQueryLoading, isError: isAuthQueryError, error: authQueryError, refetch: refetchAuthStatus, } = useQuery({
    queryKey: ['authStatus', location.pathname],
    queryFn: async () => {
      try {
        const response = await axios.get(`${AUTH_API_BASE_URL}/check-auth`, {
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
    if (!isAuthQueryError || !authQueryError) return;
  
    // extract message safely
    const msg =
      (authQueryError as any)?.response?.data?.message ||
      (authQueryError as any)?.message ||
      '';
  
    const looksLikeExpired =
      typeof msg === 'string' &&
      (msg.toLowerCase().includes('access token expired') ||
        msg.toLowerCase().includes('token expired') ||
        msg.toLowerCase().includes('jwt expired') ||
        msg.toLowerCase().includes('expired token'));
  
    if (!looksLikeExpired) return;
  
    // If we are already trying to refresh, don't do it again
    if (refreshingRef.current) return;
  
    refreshingRef.current = true;
  
    authApi.refreshToken()
      .then((refreshed) => {
        refreshingRef.current = false;
        if (refreshed) {
          // re-run the auth check; refetch is enough
          refetchAuthStatus();
        } else {
          if (!signupInProgress && isAuthenticated) {
            logout();
          }
        }
      })
      .catch((err) => {
        refreshingRef.current = false;
        console.warn('[AuthInitializer] refresh failed', err);
        if (!signupInProgress && isAuthenticated) {
          logout();
        }
      });
  }, [
    isAuthQueryError,
    authQueryError,
    refreshToken,
    refetchAuthStatus,
    signupInProgress,
    isAuthenticated,
    logout,
  ]);
  // This effect runs once to set up interceptors
  useEffect(() => {
    if (!hasSetupInterceptors.current) {
      setupApiInterceptors(logout);
      hasSetupInterceptors.current = true;
    }
  }, [logout]);

  // This effect handles the result of the auth query
  useEffect(() => {
    // Only proceed if the auth query has finished loading
    if (!isAuthQueryLoading) {
      // If data is successfully fetched and user is present
      if (data?.success && data.user) {
        console.log("[AuthInitializer] User authenticated:", data.user.userName);
        // Check if the user is already set in the store to prevent redundant calls
        if (!isAuthenticated || user?._id !== data.user._id) {
          login(data.user, false); // Login without showing toast
        }
        // Initialize cart and wishlist only if not already initialized
        initializeCart();
        initializeWishlist();
        if (!data.user.phoneNumber) {
          console.log(data)
          console.log("[AuthInitializer] Redirecting to complete profile due to missing phone number.");
          navigate("/complete-profile", { replace: true });
          return;
        }
        console.log("[AuthInitializer] Cart and Wishlist initialization triggered.");
      } else {
        console.log("[AuthInitializer] User not authenticated or check failed.");
        // Only call logout if not in signup progress AND currently authenticated
        // This prevents clearing signupInProgress if the user is in the verification flow
        // and prevents redundant logout calls if already logged out.
        if (!signupInProgress && isAuthenticated) {
          logout();
        }
      }
      // Mark initial check as complete regardless of success or failure
      setIsAuthAndDataLoaded(true);
    }
  }, [isAuthQueryLoading, data, isAuthQueryError, login, logout, initializeCart, initializeWishlist, isAuthenticated, user, signupInProgress]);

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
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-8">
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-xl text-gray-700">Loading your session...</p>
            <div className="mt-8 w-full max-w-3xl space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // After the initial check and data loading is finished, render children.
  // ProtectedRoute will then handle further redirection if isAuthenticated is false.
  return <>{children}</>;
};

export default AuthInitializer;