import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore'; // Import cart store
import { Skeleton } from './ui/skeleton';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { login, logout } = useAuthStore();
  const { initializeCart } = useCartStore(); // Get cart initializer
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/auth/check-auth', {
          withCredentials: true,
        });
        if (response.data.success) {
          login(response.data.user, false);
          await initializeCart(); // Fetch and set the cart after user is logged in
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth check failed, user is not logged in.");
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [login, logout, initializeCart]);

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