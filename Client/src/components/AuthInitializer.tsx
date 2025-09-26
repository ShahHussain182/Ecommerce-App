import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from './ui/skeleton';
import { useRefreshToken } from '@/hooks/useRefreshToken';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout } = useAuthStore();
  const { initializeCart } = useCartStore();
  const { initializeWishlist } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const { mutateAsync: refreshTokens } = useRefreshToken(); // Destructure mutateAsync directly

  // Use a ref to ensure the initial check only runs once
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) {
      return; // Already performed initial auth check
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
          // If check-auth explicitly says not successful (e.g., no user found for session)
          logout();
        }
      } catch (error: any) {
        console.error("Auth check failed:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401 && error.response?.data?.message === "Access token expired") {
          console.log("Access token expired, attempting to refresh...");
          try {
            await refreshTokens(); // Call the stable mutateAsync function
            console.log("Tokens refreshed, re-checking auth status...");
            // After successful refresh, re-run checkUserStatus to get new user data
            await checkUserStatus(); // Recursive call
          } catch (refreshError) {
            console.error("Refresh token failed, logging out:", refreshError);
            logout();
          }
        } else {
          // Any other error during check-auth (e.g., network error, invalid token, etc.)
          logout();
        }
      } finally {
        setIsLoading(false);
        hasCheckedAuth.current = true; // Mark as checked after the first full attempt
      }
    };

    checkUserStatus();
  }, [login, logout, initializeCart, initializeWishlist, refreshTokens]); // refreshTokens is a stable function

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