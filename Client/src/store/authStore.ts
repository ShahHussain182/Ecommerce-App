import { create } from 'zustand';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  signupInProgress: boolean;
  signupEmail: string | null;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  setSignupProgress: (email: string) => void;
  clearSignupProgress: () => void;
  markEmailVerified: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isVerified: false,
  signupInProgress: false,
  signupEmail: null,

  login: (user) => {
    set({
      user,
      isAuthenticated: true,
      isVerified: user.isVerified,
      signupInProgress: false, // Ensure these are cleared on login
      signupEmail: null,
    });
    toast.success("Logged in successfully!", {
      description: `Welcome back, ${user.userName}!`,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isVerified: false,
      signupInProgress: false,
      signupEmail: null,
    });
    toast.info("You have been logged out.");
  },

  setSignupProgress: (email) => {
    set({
      signupInProgress: true,
      signupEmail: email,
    });
  },

  clearSignupProgress: () => {
    set({
      signupInProgress: false,
      signupEmail: null,
    });
  },

  markEmailVerified: () => {
    set((state) => ({
      isVerified: true,
      user: state.user ? { ...state.user, isVerified: true } : null,
      signupInProgress: false, // Clear signup progress after verification
      signupEmail: null,
    }));
  },
}));