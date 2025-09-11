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
import PressPage from "./pages/PressPage"; // Import the new PressPage
import AppLayout from "./components/AppLayout";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false, // Disabled to prevent refetches on window focus during development
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="press" element={<PressPage />} /> {/* New route for PressPage */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;