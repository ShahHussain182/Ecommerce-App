import { create } from 'zustand';
import { User } from '@/types';
import { toast } from 'sonner';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore'; // Import wishlist store

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  signupInProgress: boolean;
  signupEmail: string | null;
}

interface AuthActions {
  login: (user: User, showToast?: boolean) => void;
  logout: () => void;
  setSignupProgress: (email: string) => void;
  clearSignupProgress: () => void;
  markEmailVerified: () => void;
  updateUser: (updatedUser: User) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isVerified: false,
  signupInProgress: false,
  signupEmail: null,

  login: (user, showToast = true) => {
    set({
      user,
      isAuthenticated: true,
      isVerified: user.isVerified,
      signupInProgress: false,
      signupEmail: null,
    });
    if (showToast) {
      toast.success("Logged in successfully!", {
        description: `Welcome back, ${user.userName}!`,
      });
    }
    // Initialize cart and wishlist after login
    useCartStore.getState().initializeCart();
    useWishlistStore.getState().initializeWishlist();
  },

  logout: () => {
    useCartStore.getState().clearClientCart(); // Clear cart state on logout
    useWishlistStore.getState().clearClientWishlist(); // Clear wishlist state on logout
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
      signupInProgress: false,
      signupEmail: null,
    }));
  },

  updateUser: (updatedUser) => {
    set({
      user: updatedUser,
      isVerified: updatedUser.isVerified,
    });
  },
}));