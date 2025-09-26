"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { setUser, logout, isAuthenticated, user } = useAuthStore();
  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);

  // Always run checkAuth on component mount to verify the session with the backend.
  // The persisted 'isAuthenticated' state is treated as a hint, but not a definitive truth.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkAuth'],
    queryFn: authService.checkAuth,
    enabled: true, // ALWAYS run this on mount to validate the session
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (data?.success && data.user) {
        // Check for admin role
        if (data.user.role === 'admin') {
          setUser(data.user);
        } else {
          // If not admin, log out and redirect
          logout();
          // No toast here, as it might be triggered by the login page already
        }
      } else if (isError) {
        logout(); // Server check failed, log out
      }
      setIsInitialCheckComplete(true);
    }
  }, [isLoading, data, isError, setUser, logout]);

  if (!isInitialCheckComplete || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // After initial check, if not authenticated or not admin, redirect to login
  // isAuthenticated and user?.role are now guaranteed to be in sync with the backend check
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}