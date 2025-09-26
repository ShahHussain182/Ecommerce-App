import { useMutation } from '@tanstack/react-query';
import * as authApi from '@/lib/authApi';
import { toast } from 'sonner';

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: () => {
      // No toast here, as AuthInitializer will handle the subsequent checkAuth and login
      // toast.success("Session refreshed!");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to refresh session. Please log in again.";
      toast.error("Session Expired", {
        description: errorMessage,
      });
    },
  });
};