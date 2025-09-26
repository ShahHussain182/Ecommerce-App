import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export function ProtectedRoute() {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      if (isAuthenticated && user) {
        try {
          // Periodically check if the session is still valid on the server
          const { user: freshUser } = await authService.checkAuth();
          // In a real app, you'd check for admin role here
          // if (freshUser.role !== 'admin') {
          //   throw new Error('Permission denied.');
          // }
          setUser(freshUser);
        } catch (error) {
          console.error('Session check failed:', error);
          await authService.logout().catch(() => {});
          logout();
          navigate('/login');
        }
      }
    };

    verifyUser();
  }, [isAuthenticated, user, setUser, logout, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}