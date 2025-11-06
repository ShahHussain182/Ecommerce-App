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

  // New action intended to be called by programmatic/auth flows (e.g. Google)
  setAuthenticatedUser: (user: User, showToast?: boolean) => void;
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

  // New: setAuthenticatedUser
  // Purpose: explicit programmatic setter for when you receive user data from an external flow
  // (Google sign-in, magic link, or server-initiated auth). Mirrors `login` behaviour.
  setAuthenticatedUser: (user, showToast = false) => {
    set((state) => {
      const isUserVerified = user.isVerified;

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

    // By default do NOT show toast for programmatic flows unless caller asks.
    if (showToast) {
      toast.success("Logged in successfully!", {
        description: `Welcome back, ${user.userName}!`,
      });
    }

    // Important: do NOT initialize other stores here (cart/wishlist).
    // AuthInitializer or the caller should handle initializing/refreshing dependent stores.
    // This avoids circular imports and keeps this store focused on auth state only.
  },

  logout: () => {
    // These calls are now safe here as they clear client-side state,
    // and AuthInitializer will re-initialize them on next successful login.
    // Dynamic import to avoid circular dependency issues if stores are not fully initialized yet.
    import('./cartStore').then(module => module.useCartStore.getState().clearClientCart()).catch(() => {});
    import('./wishlistStore').then(module => module.useWishlistStore.getState().clearClientWishlist()).catch(() => {});
    
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
