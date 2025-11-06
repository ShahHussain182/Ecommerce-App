// useRefreshToken.ts
import * as authApi from '@/lib/authApi';
import { toast } from 'sonner';

export const useRefreshToken = () => {
  // Return an async function that runs the refresh call and returns boolean
  const refresh = async (): Promise<boolean> => {
    try {
      await authApi.refreshToken();
      return true; // success
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to refresh session. Please log in again.";

      toast.error("Session Expired", {
        description: errorMessage,
      });
      return false; // fail
    }
  };

  return refresh;
};
