import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster here
import { Toaster as Sonner } from "@/components/ui/sonner"; // Import Sonner here

const AppLayout = () => {
  return (
    <React.Fragment>
      <ScrollToTop />
      {/* An <Outlet> renders whatever child route is currently active,
          so you can think of this as a placeholder for the child routes. */}
      <Outlet />
      <Toaster /> {/* Render Toaster here */}
      <Sonner /> {/* Render Sonner here */}
    </React.Fragment>
  );
};

export default AppLayout;