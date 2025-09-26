import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page.
    // The axios interceptor in api.ts will handle logging out
    // if a token becomes invalid during an API call.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}