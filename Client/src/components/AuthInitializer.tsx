import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from './ui/skeleton';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { setupApiInterceptors } from '@/lib/api'; // Import the setup function

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout } = useAuthStore();
  const { initializeCart } = useCartStore();
  const { initializeWishlist } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const { mutateAsync: refreshTokens } = useRefreshToken();

  const hasCheckedAuth = useRef(false);
  const hasSetupInterceptors = useRef(false); // New ref for interceptors

  useEffect(() => {
    // Setup API interceptors once
    if (!hasSetupInterceptors.current) {
      setupApiInterceptors(logout); // Pass the logout function
      hasSetupInterceptors.current = true;
    }

    if (hasCheckedAuth.current) {
      return;
    }

    const checkUserStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/auth/check-auth', {
          withCredentials: true,
        });
        if (response.data.success) {
          login(response.data.user, false);
          await initializeCart();
          await initializeWishlist();
        } else {
          logout();
        }
      } catch (error: any) {
        console.error("Auth check failed:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401 && error.response?.data?.message === "Access token expired") {
          console.log("Access token expired, attempting to refresh...");
          try {
            await refreshTokens();
            console.log("Tokens refreshed, re-checking auth status...");
            await checkUserStatus();
          } catch (refreshError) {
            console.error("Refresh token failed, logging out:", refreshError);
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setIsLoading(false);
        hasCheckedAuth.current = true;
      }
    };

    checkUserStatus();
  }, [login, logout, initializeCart, initializeWishlist, refreshTokens]);

  if (isLoading) {
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

  return <>{children}</>;
};

export default AuthInitializer;