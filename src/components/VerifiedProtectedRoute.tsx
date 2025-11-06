import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const VerifiedProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated ,isVerified} = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    console.log(`[ProtectedRoute] isAuthenticated: ${isAuthenticated}, path: ${location.pathname}`);
    if (!isAuthenticated) {
      toast.error("Access Denied", {
        description: "Please log in to view this page.",
      });
    }
  }, [isAuthenticated, location.pathname]); // Added location.pathname to dependencies

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
return <>{children}</>;
}
export default VerifiedProtectedRoute;