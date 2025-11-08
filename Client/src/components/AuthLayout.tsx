import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <Link to="/" className="text-4xl font-bold text-foreground">E-Store</Link>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover Your Next Favorite Thing.
          </p>
          <img
            src="/placeholder.svg"
            alt="E-Store Showcase"
            className="mt-8 rounded-lg shadow-2xl w-full max-w-md mx-auto"
          />
        </motion.div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
};