import { create } from 'zustand';
import { User } from '@/types';
import { toast } from 'sonner';
// Removed direct imports for useCartStore and useWishlistStore as their initialization will be handled by AuthInitializer

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
    set((state) => { // Use functional update to access current state
      const isUserVerified = user.isVerified;
      
      // Only clear signup progress if the user is now verified
      const newSignupInProgress = isUserVerified ? false : state.signupInProgress;
      const newSignupEmail = isUserVerified ? null : state.signupEmail;

      return {
        user,
        isAuthenticated: true,
        isVerified: isUserVerified,
        signupInProgress: newSignupInProgress,
        signupEmail: newSignupEmail,
      };
    });
    if (showToast) {
      toast.success("Logged in successfully!", {
        description: `Welcome back, ${user.userName}!`,
      });
    }
    // Removed direct calls to initializeCart and initializeWishlist from here.
    // AuthInitializer will now explicitly call them after login.
  },

  logout: () => {
    // These calls are now safe here as they clear client-side state,
    // and AuthInitializer will re-initialize them on next successful login.
    // Dynamic import to avoid circular dependency issues if stores are not fully initialized yet.
    import('./cartStore').then(module => module.useCartStore.getState().clearClientCart());
    import('./wishlistStore').then(module => module.useWishlistStore.getState().clearClientWishlist());
    
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