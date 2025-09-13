import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ProductsPage from "./pages/ProductsPage";
import SearchPage from "./pages/SearchPage";
import PressPage from "./pages/PressPage";
import AppLayout from "./components/AppLayout";
import React, { useEffect } from "react"; // Import useEffect
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AuthInitializer from "./components/AuthInitializer"; // Import AuthInitializer
import { useAuthStore } from "./store/authStore"; // Import useAuthStore

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Subscribe to auth state for logging
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.log("Auth Status Changed:", {
      isAuthenticated: isAuthenticated,
      user: user,
    });
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthInitializer>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Index />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="/shipping-returns" element={<ShippingReturnsPage />}/> 
                <Route path="press" element={<PressPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthInitializer>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;